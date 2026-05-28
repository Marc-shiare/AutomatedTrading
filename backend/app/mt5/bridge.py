"""ZeroMQ bridge for communication with MetaTrader 5 (MQL5 EA)."""

import json
import logging
import threading
import time
from typing import Optional

import zmq

logger = logging.getLogger(__name__)

# --- Constants ---

DEFAULT_PUSH_PORT = 5555
DEFAULT_PULL_PORT = 5556
DEFAULT_HOST = "127.0.0.1"

HEARTBEAT_TIMEOUT = 30.0  # seconds: consider MT5 dead if no heartbeat
RECONNECT_MAX_RETRIES = 10
INITIAL_BACKOFF = 1.0  # seconds


class MT5Bridge:
    """Thread-safe ZeroMQ bridge to the MQL5 QuantumTrade EA.

    The MQL5 EA exposes:
    *  PUSH socket  (Python -> MT5, port 5555 by default)
    *  PULL socket  (MT5  -> Python, port 5556 by default)
    All messages are JSON.
    """

    def __init__(self) -> None:
        self._host: str = DEFAULT_HOST
        self._push_port: int = DEFAULT_PUSH_PORT
        self._pull_port: int = DEFAULT_PULL_PORT

        self._context: Optional[zmq.Context] = None
        self._push_socket: Optional[zmq.Socket] = None
        self._pull_socket: Optional[zmq.Socket] = None

        self._connected: bool = False
        self._alive: bool = False
        self._last_heartbeat: Optional[float] = None  # unix timestamp
        self._account_info: dict = {}
        self._open_positions: list[dict] = []

        self._lock = threading.Lock()
        self._poller: Optional[zmq.Poller] = None
        self._listener_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()

    # ------------------------------------------------------------------ #
    # Connection lifecycle
    # ------------------------------------------------------------------ #

    def connect(self, host: str = "127.0.0.1", port: int = 5555) -> dict:
        """Connect to the MQL5 EA via ZeroMQ.

        * port   ->  PUSH port (5555)
        * PULL port is assumed to be port + 1 (5556)
        """
        with self._lock:
            if self._connected:
                return {"status": "already_connected"}

            self._host = host
            self._push_port = port
            self._pull_port = port + 1

            try:
                self._context = zmq.Context()

                # PUSH socket - Python sends commands to MT5
                self._push_socket = self._context.socket(zmq.PUSH)
                self._push_socket.setsockopt(zmq.LINGER, 1000)
                self._push_socket.connect(f"tcp://{host}:{self._push_port}")

                # PULL socket - Python receives responses/heartbeats from MT5
                self._pull_socket = self._context.socket(zmq.PULL)
                self._pull_socket.setsockopt(zmq.LINGER, 1000)
                self._pull_socket.connect(f"tcp://{host}:{self._pull_port}")

                # Start background listening thread for heartbeats
                self._stop_event.clear()
                self._listener_thread = threading.Thread(
                    target=self._listen_loop,
                    daemon=True,
                    name="mt5_listener",
                )
                self._listener_thread.start()

                self._connected = True
                self._alive = True
                self._last_heartbeat = time.time()
                logger.info("MT5 Bridge connected to %s:%d/%d", host, self._push_port, self._pull_port)
                return {"status": "connected"}

            except Exception as exc:
                self._cleanup_sockets()
                logger.error("Failed to connect to MT5: %s", exc, exc_info=True)
                return {"status": "error", "error": str(exc)}

    def disconnect(self) -> dict:
        """Disconnect from MT5 and release all resources."""
        with self._lock:
            self._stop_event.set()
            self._cleanup_sockets()
            self._connected = False
            self._alive = False
            self._last_heartbeat = None
            self._account_info = {}
            self._open_positions = []

        # Wait for background listener to finish (briefly)
        if self._listener_thread and self._listener_thread.is_alive():
            self._listener_thread.join(timeout=1.0)

        logger.info("MT5 Bridge disconnected")
        return {"status": "disconnected"}

    def _cleanup_sockets(self) -> None:
        if self._pull_socket is not None:
            self._pull_socket.close()
            self._pull_socket = None
        if self._push_socket is not None:
            self._push_socket.close()
            self._push_socket = None
        if self._context is not None:
            self._context.term()
            self._context = None

    # ------------------------------------------------------------------ #
    # Internal listener
    # ------------------------------------------------------------------ #

    def _listen_loop(self) -> None:
        """Background thread: read PULL socket for heartbeats/responses."""
        if self._pull_socket is None:
            return

        self._poller = zmq.Poller()
        self._poller.register(self._pull_socket, zmq.POLLIN)

        while not self._stop_event.is_set():
            try:
                events = self._poller.poll(timeout=5000)
                if not events:
                    continue
                if self._pull_socket in (sock for sock, _ in events):
                    message = self._pull_socket.recv_json()
                    self._handle_message(message)
            except zmq.ZMQError as exc:
                logger.error("ZMQ error in MT5 listener: %s", exc, exc_info=True)
                time.sleep(1)
            except Exception as exc:
                logger.error("MT5 listener error: %s", exc, exc_info=True)
                time.sleep(1)

    def _handle_message(self, message: dict) -> None:
        """Process incoming messages from the MQL5 EA."""
        msg_type = message.get("type", "")

        if msg_type == "heartbeat":
            self._alive = True
            self._last_heartbeat = time.time()
            if "account_info" in message:
                self._account_info = message["account_info"]
            if "positions" in message:
                self._open_positions = message["positions"]
        elif msg_type == "account_info":
            if "data" in message:
                self._account_info = message["data"]
        elif msg_type == "positions":
            if "data" in message:
                self._open_positions = message["data"]
        else:
            logger.debug("Received MT5 message: %s", message)

    # ------------------------------------------------------------------ #
    # Command helpers (with basic backoff retry)
    # ------------------------------------------------------------------ #

    def _send(self, command: dict) -> dict:
        """Low-level JSON send via PUSH socket with lock protection."""
        with self._lock:
            if self._push_socket is None or not self._connected:
                return {"status": "error", "error": "not_connected"}
            try:
                self._push_socket.send_json(command, flags=zmq.NOBLOCK)
                return {"status": "sent", "command": command["action"]}
            except zmq.Again:
                return {"status": "error", "error": "send_queue_full"}
            except zmq.ZMQError as exc:
                logger.error("ZMQ send error: %s", exc, exc_info=True)
                return {"status": "error", "error": str(exc)}

    def send_command(self, command: dict) -> dict:
        """Send a JSON command to the MQL5 EA.

        Returns a dict with ``status`` and, on error, an ``error`` key.
        Uses exponential backoff to retry the connection if not yet connected.
        """
        if not self._connected:
            return {"status": "error", "error": "not_connected"}

        backoff = INITIAL_BACKOFF
        retries = 0

        result = self._send(command)
        while result.get("status") == "error" and retries < RECONNECT_MAX_RETRIES:
            logger.warning("MT5 send failed (%s), retrying in %.1fs", result.get("error"), backoff)
            time.sleep(backoff)
            backoff = min(backoff * 2, 30)
            retries += 1
            # Re-attempt one-shot reconnect
            result = self._send(command)

        return result

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def get_account_info(self) -> dict:
        """Request (or return cached) account info from MT5."""
        if not self._connected:
            return {"status": "error", "error": "not_connected"}
        self.send_command({"action": "get_account_info"})
        # The background listener will populate _account_info asynchronously.
        # Return the most recent data we have.
        return {
            "status": "ok",
            "data": self._account_info,
        }

    def get_positions(self) -> list[dict]:
        """Request (or return cached) open positions from MT5."""
        if not self._connected:
            return []
        self.send_command({"action": "get_positions"})
        return self._open_positions

    def send_heartbeat(self) -> dict:
        """Send a manual heartbeat request to MT5."""
        return self.send_command({"action": "heartbeat"})

    def update_params(self, params: dict) -> dict:
        """Update strategy parameters in the running MQL5 EA."""
        return self.send_command({"action": "update_params", "params": params})

    def stop_trading(self) -> dict:
        """Signal the MQL5 EA to stop trading."""
        return self.send_command({"action": "stop_trading"})

    def emergency_close(self) -> dict:
        """Signal the MQL5 EA to close all open positions immediately."""
        return self.send_command({"action": "emergency_close"})

    # ------------------------------------------------------------------ #
    # Health & status
    # ------------------------------------------------------------------ #

    def is_connected(self) -> bool:
        return self._connected

    def is_alive(self) -> bool:
        """Use cached flag; caller can also evaluate last heartbeat timestamp."""
        return self._alive

    def get_last_heartbeat(self) -> Optional[float]:
        return self._last_heartbeat

    def health_check(self) -> dict:
        """Return a snapshot of the bridge's internal health."""
        stale = self._last_heartbeat is None or (time.time() - self._last_heartbeat) > HEARTBEAT_TIMEOUT
        if stale:
            self._alive = False

        return {
            "connected": self._connected,
            "alive": self._alive and not stale,
            "last_heartbeat": self._last_heartbeat,
            "account_info": self._account_info,
            "open_position_count": len(self._open_positions),
        }

    # ------------------------------------------------------------------ #
    # Exponential-backoff reconnect (public helper for external callers)
    # ------------------------------------------------------------------ #

    def reconnect(self, host: str = "127.0.0.1", port: int = 5555) -> dict:
        """Disconnect then reconnect with exponential backoff."""
        self.disconnect()
        backoff = INITIAL_BACKOFF
        for attempt in range(1, RECONNECT_MAX_RETRIES + 1):
            logger.info("Reconnect attempt %d/%d...", attempt, RECONNECT_MAX_RETRIES)
            result = self.connect(host, port)
            if result["status"] == "connected":
                return result
            time.sleep(backoff)
            backoff = min(backoff * 2, 30)
        return {"status": "failed", "error": f"Could not reconnect after {RECONNECT_MAX_RETRIES} attempts"}
