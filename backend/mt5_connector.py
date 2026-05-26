"""
QuantumTrade MetaTrader 5 ZeroMQ Connector
Production-hardened with circuit breaker, health checks,
automatic reconnection, and comprehensive error handling.
"""

import json
import threading
import time
import logging
import uuid
from dataclasses import dataclass, asdict, field
from typing import Callable, Dict, Optional
from datetime import datetime, timedelta
from enum import Enum

import zmq
from zmq import Socket as ZmqSocket

# ── Logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("mt5_connector")


# ── Exceptions ─────────────────────────────────────────────────────
class MT5ConnectionError(Exception):
    """Raised when connection to MT5 is lost or cannot be established."""
    pass


class MT5CommandError(Exception):
    """Raised when a command to MT5 fails or times out."""
    pass


# ── Configuration ─────────────────────────────────────────────────
@dataclass
class MT5Config:
    host: str = "localhost"
    port: int = 5555
    heartbeat_interval: int = 5  # seconds
    connection_timeout: float = 5.0
    max_retries: int = 5
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout: float = 30.0  # seconds to wait before retry
    reconnect_delay: float = 1.0  # initial reconnect delay (doubles each attempt)
    max_reconnect_delay: float = 30.0


# ── Circuit Breaker ───────────────────────────────────────────────
class CircuitBreaker:
    """
    Prevents cascading failures by temporarily rejecting requests
    after consecutive failures exceed a threshold.
    """

    class State(Enum):
        CLOSED = "closed"      # Normal operation
        OPEN = "open"          # Failing fast
        HALF_OPEN = "half_open" # Testing if recovered

    def __init__(self, threshold: int, timeout: float):
        self.threshold = threshold
        self.timeout = timeout
        self.state = self.State.CLOSED
        self.failure_count = 0
        self.last_failure_time: Optional[datetime] = None

    def record_success(self):
        """Record a successful operation."""
        self.failure_count = 0
        self.state = self.State.CLOSED

    def record_failure(self):
        """Record a failed operation."""
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        if self.failure_count >= self.threshold and self.state != self.State.OPEN:
            self.state = self.State.OPEN
            logger.warning(f"Circuit breaker opened after {self.failure_count} failures")

    def can_execute(self) -> bool:
        """Check if operations are allowed."""
        if self.state == self.State.CLOSED:
            return True
        if self.state == self.State.HALF_OPEN:
            return True
        if self.state == self.State.OPEN and self.last_failure_time:
            elapsed = (datetime.utcnow() - self.last_failure_time).total_seconds()
            if elapsed >= self.timeout:
                self.state = self.State.HALF_OPEN
                logger.info("Circuit breaker entering half-open state, testing...")
                return True
        return False

    def should_retry(self) -> bool:
        """Check if a retry should be attempted."""
        return self.state in (self.State.HALF_OPEN, self.State.CLOSED)


# ── Data Classes ─────────────────────────────────────────────────
@dataclass
class StrategyConfig:
    name: str
    symbol: str
    timeframe: str
    parameters: Dict = field(default_factory=dict)
    magic_number: int = 123456
    enabled: bool = True


@dataclass
class AccountInfo:
    login: int = 0
    server: str = "" 
    currency: str = ""
    leverage: int = 0
    balance: float = 0.0
    equity: float = 0.0
    margin: float = 0.0
    free_margin: float = 0.0
    profit: float = 0.0


# ── Metrics Tracking ──────────────────────────────────────────────
class ConnectorMetrics:
    """Tracks connector health metrics."""

    def __init__(self):
        self.total_requests = 0
        self.failed_requests = 0
        self.heartbeats_received = 0
        self.heartbeats_missed = 0
        self.last_request_time: Optional[datetime] = None
        self.average_response_time = 0.0

    def record_request(self, duration: float, success: bool):
        self.total_requests += 1
        if not success:
            self.failed_requests += 1

    def record_heartbeat(self, received: bool):
        if received:
            self.heartbeats_received += 1
        else:
            self.heartbeats_missed += 1

    def get_stats(self) -> Dict:
        return {
            "total_requests": self.total_requests,
            "failed_requests": self.failed_requests,
            "success_rate": (
                (self.total_requests - self.failed_requests) / self.total_requests
                if self.total_requests > 0
                else 0
            ),
            "heartbeats_received": self.heartbeats_received,
            "heartbeats_missed": self.heartbeats_missed,
        }


# ── Main Connector ──────────────────────────────────────────────
class MT5ZeroMQConnector:
    """
    ZeroMQ connector for MetaTrader 5 (MQL5 Expert Advisor).

    Implements PUSH/PULL and circuit breaker for fault tolerance.

    Usage:
        >>> with MT5ZeroMQConnector() as mt5:
        ...     mt5.deploy_strategy(config)
        ...     info = mt5.get_account_info()
    """

    def __init__(self, config: MT5Config = None):
        self.config = config or MT5Config()
        self.context: Optional[zmq.Context] = None
        self.push_socket: Optional[ZmqSocket] = None
        self.pull_socket: Optional[ZmqSocket] = None
        self.is_connected = False
        self.account_info: Optional[AccountInfo] = None
        self.last_heartbeat: Optional[datetime] = None
        self._message_callback: Optional[Callable] = None
        self._heartbeat_thread: Optional[threading.Thread] = None
        self._stop_heartbeat = threading.Event()
        self._reconnect_delay = self.config.reconnect_delay
        self._lock = threading.RLock()
        self.metrics = ConnectorMetrics()
        self.circuit_breaker = CircuitBreaker(
            self.config.circuit_breaker_threshold,
            self.config.circuit_breaker_timeout,
        )

    # ── Connection Management ──────────────────────────────────────
    def connect(self) -> bool:
        """Initialize ZeroMQ sockets and connect to MT5 with retry logic."""
        if self.circuit_breaker.state == CircuitBreaker.State.OPEN:
            if not self.circuit_breaker.can_execute():
                raise MT5ConnectionError("Circuit breaker is open. Cannot connect.")

        for attempt in range(1, self.config.max_retries + 1):
            try:
                logger.info(f"Connecting to MT5 (attempt {attempt}/{self.config.max_retries})...")

                if self.context:
                    self.disconnect()

                self.context = zmq.Context()

                # PUSH socket for sending commands to MT5
                self.push_socket = self.context.socket(zmq.PUSH)
                self.push_socket.set(zmq.SNDHWM, 1000)
                self.push_socket.set(zmq.LINGER, 0)  # Don't block on close

                address = f"tcp://{self.config.host}:{self.config.port}"
                self.push_socket.bind(address)

                # PULL socket for receiving data from MT5
                self.pull_socket = self.context.socket(zmq.PULL)
                self.pull_socket.set(zmq.RCVHWM, 1000)
                self.pull_socket.set(zmq.LINGER, 0)
                self.pull_socket.set(
                    zmq.RCVTIMEO, int(self.config.connection_timeout * 1000)
                )
                self.pull_socket.bind(f"tcp://{self.config.host}:{self.config.port + 1}")

                self.is_connected = True
                self._reconnect_delay = self.config.reconnect_delay  # Reset on success
                self.circuit_breaker.record_success()
                self._start_heartbeat()

                logger.info("Connected to MT5 successfully.")
                return True

            except zmq.error.ZMQError as e:
                logger.error(f"Connection attempt {attempt} failed: {e}")
                self.disconnect()
                time.sleep(self._reconnect_delay)
                self._reconnect_delay = min(
                    self._reconnect_delay * 2, self.config.max_reconnect_delay
                )

        self.circuit_breaker.record_failure()
        raise MT5ConnectionError(
            f"Failed to connect to MT5 after {self.config.max_retries} attempts."
        )

    def disconnect(self):
        """Clean up sockets and context."""
        self._stop_heartbeat.set()

        with self._lock:
            if self.push_socket:
                try:
                    self.push_socket.close()
                except:
                    pass
                self.push_socket = None

            if self.pull_socket:
                try:
                    self.pull_socket.close()
                except:
                    pass
                self.pull_socket = None

            if self.context:
                try:
                    self.context.destroy(linger=0)
                except:
                    pass
                self.context = None

            self.is_connected = False

        logger.info("Disconnected from MT5.")

    # ── Command Methods ────────────────────────────────────────────
    def deploy_strategy(self, config: StrategyConfig) -> Dict:
        """Deploy a strategy to MT5 via ZeroMQ."""
        message = {
            "action": "update_params",
            "strategy_name": config.name,
            "symbol": config.symbol,
            "timeframe": config.timeframe,
            "magic_number": config.magic_number,
            "parameters": config.parameters,
            "timestamp": datetime.utcnow().isoformat(),
        }
        return self._send_and_wait(message)

    def stop_trading(self) -> Dict:
        return self._send_command("stop_trading")

    def start_trading(self) -> Dict:
        return self._send_command("start_trading")

    def emergency_close_all(self) -> Dict:
        logger.critical("EMERGENCY CLOSE triggered via API")
        return self._send_command("emergency_close")

    def get_account_info(self) -> AccountInfo:
        response = self._send_command("get_account_info")
        if response and "login" in response:
            self.account_info = AccountInfo(**{k: response.get(k, 0) for k, _ in AccountInfo().__dict__.items()})
            return self.account_info
        return self.account_info or AccountInfo()

    # ── Private Methods ──────────────────────────────────────────
    def _send_command(self, action: str) -> Dict:
        message = {
            "action": action,
            "timestamp": datetime.utcnow().isoformat(),
        }
        return self._send_and_wait(message)

    def _send_and_wait(self, message: Dict, timeout: float = 5.0) -> Dict:
        if not self.circuit_breaker.can_execute():
            raise MT5ConnectionError("Circuit breaker is open. Cannot execute command.")

        if not self.is_connected:
            self.connect()

        start_time = time.time()
        try:
            self._send(message)
            response = self._receive(timeout=timeout) or {"status": "no_response"}

            elapsed = time.time() - start_time

            if response.get("status") == "error":
                self.circuit_breaker.record_failure()
                self.metrics.record_request(elapsed, False)
                raise MT5CommandError(f"MT5 command failed: {response}")

            self.circuit_breaker.record_success()
            self.metrics.record_request(elapsed, True)
            return response

        except (zmq.error.ZMQError, MT5CommandError):
            self.circuit_breaker.record_failure()
            self.metrics.record_request(time.time() - start_time, False)
            raise

    def _send(self, message: Dict):
        with self._lock:
            if not self.push_socket:
                raise ConnectionError("ZMQ not connected")
            self.push_socket.send_json(message, flags=zmq.NOBLOCK)

    def _receive(self, timeout: float = 1.0) -> Optional[Dict]:
        if not self.pull_socket:
            return None

        self.pull_socket.set(zmq.RCVTIMEO, int(timeout * 1000))
        try:
            message = self.pull_socket.recv_json(flags=zmq.NOBLOCK)
            self._process_message(message)
            return message
        except zmq.error.Again:
            return None

    def _process_message(self, message: Dict):
        if not message or not isinstance(message, dict):
            return

        action = message.get("action")

        if action == "heartbeat":
            self.last_heartbeat = datetime.utcnow()
            self.metrics.record_heartbeat(True)
        elif self._message_callback:
            self._message_callback(action, message)

    # ── Heartbeat ────────────────────────────────────────────────
    def _start_heartbeat(self):
        self._stop_heartbeat.clear()
        self._heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop, daemon=True
        )
        self._heartbeat_thread.start()

    def _heartbeat_loop(self):
        while not self._stop_heartbeat.is_set():
            try:
                self._send({
                    "action": "heartbeat_ack",
                    "timestamp": datetime.utcnow().isoformat(),
                })
            except Exception:
                pass
            time.sleep(self.config.heartbeat_interval)

    def is_alive(self) -> bool:
        if not self.last_heartbeat:
            return False
        elapsed = (datetime.utcnow() - self.last_heartbeat).total_seconds()
        return elapsed < (self.config.heartbeat_interval * 3)

    def get_metrics(self) -> Dict:
        return self.metrics.get_stats()

    # ── Handlers ─────────────────────────────────────────────────
    def set_message_handler(self, callback: Callable):
        self._message_callback = callback

    # ── Context Manager ──────────────────────────────────────────
    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
        return False


# ── FastAPI Integration (Commented Example) ───────────────────────
"""
from fastapi import FastAPI, HTTPException

app = FastAPI()
mt5 = MT5ZeroMQConnector()

@app.on_event("startup")
async def startup():
    mt5.connect()

@app.on_event("shutdown")
async def shutdown():
    mt5.disconnect()

@app.post("/api/mt5/deploy")
async def deploy_strategy(config: StrategyConfig):
    try:
        result = mt5.deploy_strategy(config)
        return {"status": "success", "result": result}
    except MT5ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except MT5CommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mt5/status")
async def get_status():
    return {
        "connected": mt5.is_connected,
        "alive": mt5.is_alive(),
        "circuit_breaker": mt5.circuit_breaker.state.value,
        "metrics": mt5.get_metrics(),
    }
"""