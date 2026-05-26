from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    create_engine,
    ForeignKey,
    JSON,
    Enum,
    Text,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base


class StrategyStatus(str, enum.Enum):
    ready = "ready_for_deployment"
    deployed = "deployed"
    failed = "failed"


class TradeSide(str, enum.Enum):
    buy = "BUY"
    sell = "SELL"


class TradeStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


class RiskLevel(str, enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"
    critical = "critical"


class NewsImpact(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Strategy(Base):
    """Stores optimized strategy configurations and backtest results."""

    __tablename__ = "strategies"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    symbol = Column(String(16), nullable=False, index=True)
    pair = Column(String(16), nullable=False)
    base_currency = Column(String(8), nullable=False)
    quote_currency = Column(String(8), nullable=False)

    optimization_date = Column(DateTime, default=datetime.utcnow, index=True)
    composite_score = Column(Float, nullable=False)
    status = Column(Enum(StrategyStatus), default=StrategyStatus.ready)
    previous_scores = Column(JSON, default=list)

    # Parameters stored as JSON for flexibility
    parameters = Column(JSON, nullable=False)

    # Backtest metrics stored as JSON
    backtest_metrics = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trades = relationship("Trade", back_populates="strategy", lazy="dynamic")
    positions = relationship("Position", back_populates="strategy", lazy="dynamic")

    def __repr__(self):
        return f"<Strategy(id={self.id}, name={self.name}, score={self.composite_score})>"


class Trade(Base):
    """Stores executed live trades."""

    __tablename__ = "trades"

    id = Column(String(64), primary_key=True, index=True)
    strategy_id = Column(String(64), ForeignKey("strategies.id"), nullable=False, index=True)
    symbol = Column(String(16), nullable=False, index=True)
    pair = Column(String(16), nullable=False)

    side = Column(Enum(TradeSide), nullable=False)
    entry_time = Column(DateTime, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_time = Column(DateTime, nullable=True)
    exit_price = Column(Float, nullable=True)

    lot_size = Column(Float, nullable=False, default=0.5)
    position_size = Column(Float, nullable=False, default=0.5)
    pnl = Column(Float, nullable=False, default=0.0)
    pnl_pips = Column(Float, nullable=False, default=0.0)
    pnl_percent = Column(Float, nullable=False, default=0.0)
    risk_reward_ratio = Column(Float, nullable=False, default=2.0)
    spread_pips = Column(Float, nullable=False, default=0.5)
    commission = Column(Float, nullable=False, default=7.0)
    status = Column(Enum(TradeStatus), default=TradeStatus.open)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    strategy = relationship("Strategy", back_populates="trades")

    def __repr__(self):
        return f"<Trade(id={self.id}, pair={self.pair}, pnl={self.pnl})>"


class Position(Base):
    """Stores current open positions."""

    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(16), nullable=False, index=True)
    pair = Column(String(16), nullable=False)
    strategy_id = Column(String(64), ForeignKey("strategies.id"), nullable=False, index=True)

    side = Column(Enum(TradeSide), nullable=False)
    current_lot_size = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    unrealized_pnl = Column(Float, nullable=False, default=0.0)
    unrealized_pips = Column(Float, nullable=False, default=0.0)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.normal)
    max_daily_drawdown_used = Column(Float, nullable=False, default=0.0)
    max_daily_drawdown_limit = Column(Float, nullable=False, default=0.1)
    timestamp = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    strategy = relationship("Strategy", back_populates="positions")

    def __repr__(self):
        return f"<Position(pair={self.pair}, side={self.side}, pnl={self.unrealized_pnl})>"


class OptimizerRun(Base):
    """Tracks optimizer execution history."""

    __tablename__ = "optimizer_runs"

    id = Column(String(64), primary_key=True, index=True)
    status = Column(String(16), default="idle")  # idle, running, completed, failed
    progress = Column(Float, default=0.0)
    current_iteration = Column(Integer, default=0)
    total_iterations = Column(Integer, default=500000)
    best_score = Column(Float, default=0.0)
    eta_seconds = Column(Integer, default=0)
    parameters = Column(JSON, nullable=True)

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<OptimizerRun(id={self.id}, status={self.status}, score={self.best_score})>"


class NewsEvent(Base):
    """News events for risk monitoring."""

    __tablename__ = "news_events"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(Text, nullable=False)
    impact = Column(Enum(NewsImpact), nullable=False)
    scheduled_time = Column(DateTime, nullable=False, index=True)
    currency = Column(String(8), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<NewsEvent(title={self.title[:30]}..., impact={self.impact})>"
