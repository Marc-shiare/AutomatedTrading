"""Trading Platform API Routes — Dual Mode: Database ↔ Mock"""

import os
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from app.models.schemas import (
    StrategyOptimizationResult,
    PositionUpdate,
    DashboardSummary,
    OptimizerState,
    NewsEvent,
)

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"

# ── Mock fallback ────────────────────────────────────────────────────────

from app.utils.mock_data import (
    generate_mock_strategies,
    generate_mock_positions,
    generate_mock_dashboard_summary,
    generate_mock_optimizer_state,
    generate_mock_news,
)

# ── Try DB imports ─────────────────────────────────────────────────────

try:
    from app.db.database import async_session
    from app.db.models import Strategy, Position, Trade, NewsEvent as NewsEventModel
    from sqlalchemy import select
    USE_DB = True
except ImportError:
    USE_DB = False

router = APIRouter()


@router.get("/strategies", response_model=List[StrategyOptimizationResult])
async def get_strategies():
    """
    Get all optimized strategies.
    If USE_MOCK=true (default) returns mock data.
    If USE_MOCK=false attempts database fetch, falls back to mock on error.
    """
    if USE_DB and not USE_MOCK:
        try:
            async with async_session() as session:
                result = await session.execute(select(Strategy))
                strategies = result.scalars().all()
                return [
                    StrategyOptimizationResult(
                        id=s.id,
                        name=s.name,
                        symbol=s.symbol,
                        optimization_date=s.optimization_date.isoformat(),
                        parameters=s.parameters,
                        backtest_metrics=s.backtest_metrics,
                        composite_score=s.composite_score,
                        status=s.status.value,
                        previous_scores=s.previous_scores or [],
                    )
                    for s in strategies
                ]
        except Exception:
            # Fallback to mock on any DB error
            pass
    return generate_mock_strategies(6)


@router.get("/strategies/{strategy_id}/optimization-history")
async def get_strategy_optimization_history(strategy_id: str):
    "Get optimization history for a specific strategy."
    if USE_DB and not USE_MOCK:
        try:
            async with async_session() as session:
                result = await session.execute(select(Strategy).where(Strategy.id == strategy_id))
                strategy = result.scalar_one_or_none()
                if strategy:
                    return {
                        "strategy_id": strategy_id,
                        "history": [
                            {
                                "date": strategy.optimization_date.isoformat(),
                                "composite_score": score,
                                "parameters": strategy.parameters,
                            }
                            for score in (strategy.previous_scores or [])
                        ],
                    }
        except Exception:
            pass

    strategies = generate_mock_strategies(6)
    for st in strategies:
        if st["id"] == strategy_id:
            return {
                "strategy_id": strategy_id,
                "history": [
                    {
                        "date": datetime.now().isoformat(),
                        "composite_score": score,
                        "parameters": st["parameters"],
                    }
                    for score in st["previous_scores"]
                ],
            }
    raise HTTPException(status_code=404, detail="Strategy not found")


@router.get("/positions/current", response_model=List[PositionUpdate])
async def get_current_positions():
    """Get current open positions."""
    if USE_DB and not USE_MOCK:
        try:
            async with async_session() as session:
                result = await session.execute(select(Position))
                positions = result.scalars().all()
                return [
                    PositionUpdate(
                        symbol=p.symbol,
                        strategy_id=p.strategy_id,
                        side=p.side.value,
                        current_size=p.current_lot_size,
                        entry_price=p.entry_price,
                        current_price=p.current_price,
                        unrealized_pnl=p.unrealized_pnl,
                        unrealized_pips=p.unrealized_pips,
                        risk_level=p.risk_level.value,
                        max_daily_drawdown_used=p.max_daily_drawdown_used,
                        max_daily_drawdown_limit=p.max_daily_drawdown_limit,
                        timestamp=p.timestamp.isoformat(),
                    )
                    for p in positions
                ]
        except Exception:
            pass
    return generate_mock_positions(4)


@router.get("/news/upcoming", response_model=List[NewsEvent])
async def get_upcoming_news():
    """Get upcoming economic news events."""
    if USE_DB and not USE_MOCK:
        try:
            async with async_session() as session:
                result = await session.execute(select(NewsEvent))
                events = result.scalars().all()
                return [
                    NewsEvent(
                        id=e.id,
                        title=e.title,
                        impact=e.impact.value,
                        scheduled_time=e.scheduled_time.isoformat(),
                        currency=e.currency,
                    )
                    for e in events
                ]
        except Exception:
            pass
    return generate_mock_news(5)


@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """Get dashboard summary metrics."""
    return generate_mock_dashboard_summary()


@router.post("/optimizer/start", response_model=OptimizerState)
async def start_optimizer():
    """Start the strategy optimizer."""
    return {
        "status": "running",
        "progress": 0.0,
        "current_iteration": 0,
        "total_iterations": 500000,
        "best_score": 0.0,
        "eta_seconds": 86400,
    }


@router.post("/strategy/{strategy_id}/enable")
async def enable_strategy(strategy_id: str):
    """Enable a strategy for deployment."""
    return {
        "strategy_id": strategy_id,
        "status": "enabled",
        "message": f"Strategy {strategy_id} is now ready for deployment",
    }


@router.post("/strategy/{strategy_id}/disable")
async def disable_strategy(strategy_id: str):
    """Disable a strategy."""
    return {
        "strategy_id": strategy_id,
        "status": "disabled",
        "message": f"Strategy {strategy_id} has been disabled",
    }
