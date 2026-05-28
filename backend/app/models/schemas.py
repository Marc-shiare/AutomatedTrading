from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Literal


class StrategyParameters(BaseModel):
    fast_ma: int
    slow_ma: int
    rsi_threshold: int
    stop_loss_pips: int
    risk_per_trade: float


class BacktestMetrics(BaseModel):
    total_trades: int
    win_rate: float
    profit_factor: float
    max_drawdown: float
    sharpe_ratio: float
    return_percent: float


class StrategyOptimizationResult(BaseModel):
    id: str
    name: str
    symbol: str
    optimization_date: str
    parameters: StrategyParameters
    backtest_metrics: BacktestMetrics
    composite_score: float
    status: Literal["ready_for_deployment", "deployed", "failed"]
    previous_scores: List[float]


class LiveTrade(BaseModel):
    id: str
    strategy_id: str
    symbol: str
    side: Literal["BUY", "SELL"]
    entry_time: str
    entry_price: float
    exit_time: str | None = None
    exit_price: float | None = None
    position_size: float
    pnl: float
    pnl_percent: float
    risk_reward_ratio: float
    slippage_pips: float
    spread_pips: float = 0.0
    commission: float = 0.0
    status: Literal["open", "closed"]


class PositionUpdate(BaseModel):
    symbol: str
    strategy_id: str
    side: Literal["BUY", "SELL"]
    current_size: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    unrealized_pips: float
    risk_level: Literal["low", "normal", "high", "critical"]
    max_daily_drawdown_used: float
    max_daily_drawdown_limit: float
    timestamp: str


class DashboardSummary(BaseModel):
    total_pnl: float
    win_rate: float
    sharpe_ratio: float
    max_drawdown: float
    active_strategies: int
    total_trades_today: int


class OptimizerState(BaseModel):
    status: Literal["idle", "running", "completed", "failed"]
    progress: float
    current_iteration: int
    total_iterations: int
    best_score: float
    eta_seconds: int


class NewsEvent(BaseModel):
    id: str
    title: str
    impact: Literal["low", "medium", "high"]
    scheduled_time: str
    currency: str


# --- MT5 Integration Schemas (Phase 5) ---


class MT5AccountInfo(BaseModel):
    login: int
    server: str
    currency: str
    leverage: int
    balance: float
    equity: float
    margin: float
    free_margin: float
    profit: float


class MT5ConnectionStatus(BaseModel):
    connected: bool
    alive: bool
    last_heartbeat: str | None = None
    account_info: MT5AccountInfo | None = None


class MT5StrategyConfig(BaseModel):
    name: str
    symbol: str
    timeframe: str
    parameters: StrategyParameters
    magic_number: int
    enabled: bool
