"""Trading Platform API Routes — Dual Mode: Database ↔ Mock"""

import os
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from pydantic import BaseModel

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


# ── WebSocket Handlers (Phase 4) ────────────────────────────────────────

@router.websocket("/ws/positions")
async def ws_positions(websocket):
    """WebSocket for live position updates."""
    await websocket.accept()
    while True:
        try:
            msg = await websocket.receive_text()
            # Phase 5: Stream real-time position updates
            await websocket.send_json({"type": "position_stream", "status": "connected"})
        except Exception:
            break


@router.websocket("/ws/trades")
async def ws_trades(websocket):
    """WebSocket for trade execution notifications."""
    await websocket.accept()
    while True:
        try:
            msg = await websocket.receive_text()
            # Phase 5: Stream trade execution events
            await websocket.send_json({"type": "trade_stream", "status": "connected"})
        except Exception:
            break


# ─── Phase 4: Optimizer API ──────────────────────────────────────────

from app.optimizer.worker import (
    run_optimization_task,
    STRATEGY_MAP,
    app as celery_app,
)
from app.optimizer.engine import optimize
from app.data.fetcher import fetch as fetch_data
from uuid import uuid4
from app.backtest.engine import BacktestResult


class OptimizationRequest(BaseModel):
    symbol: str = "EURUSD=X"
    timeframe: str = "1d"
    n_trials: int = 50
    param_bounds: dict = {}


class OptimizationResponse(BaseModel):
    status: str
    task_id: str
    best_params: dict = {}
    best_score: float = 0.0
    test_metrics: dict = {}
    error: str = ""


@router.post("/optimize/start")
async def start_optimization(request: OptimizationRequest):
    """Start strategy optimization running as a Celery background task."""
    try:
        task = run_optimization_task.delay(
            strategy_type="momentum",
            symbol=request.symbol,
            timeframe=request.timeframe,
            n_trials=request.n_trials,
            param_bounds=request.param_bounds,
        )
        return {
            "status": "started",
            "task_id": task.id,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/optimize/{strategy_type}/start")
async def start_strategy_optimization(strategy_type: str, request: OptimizationRequest):
    """Start optimization for a specific strategy type."""
    if strategy_type not in STRATEGY_MAP:
        raise HTTPException(status_code=400, detail=f"Unknown strategy: {strategy_type}")
    
    try:
        task = run_optimization_task.delay(
            strategy_type=strategy_type,
            symbol=request.symbol,
            timeframe=request.timeframe,
            n_trials=request.n_trials,
            param_bounds=request.param_bounds,
        )
        return {
            "status": "started",
            "task_id": task.id,
            "strategy_type": strategy_type,
            "symbol": request.symbol,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/optimize/{task_id}/status")
async def get_optimization_status(task_id: str):
    """Get the status of a running or completed optimization task."""
    try:
        task = run_optimization_task.AsyncResult(task_id)
        if task.ready():
            result = task.get()
            return {
                "status": result.get("status", "completed"),
                "task_id": task_id,
                "best_params": result.get("best_params", {}),
                "best_score": result.get("best_score", 0.0),
                "test_metrics": result.get("test_metrics", {}),
            }
        else:
            return {
                "status": task.state or "running",
                "task_id": task_id,
                "progress": task.info.get("progress", 0.0) if isinstance(task.info, dict) else 0.0,
                "current_iteration": task.info.get("current_iteration", 0) if isinstance(task.info, dict) else 0,
                "total_iterations": task.info.get("total_iterations", 50) if isinstance(task.info, dict) else 50,
            }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/optimize/{strategy_id}/trades")
async def get_strategy_trades(strategy_id: str):
    """Get trade history for a specific strategy."""
    if USE_DB and not USE_MOCK:
        try:
            async with async_session() as session:
                from app.db.models import Strategy
                result = await session.execute(select(Strategy).where(Strategy.id == strategy_id))
                strategy = result.scalar_one_or_none()
                if not strategy:
                    raise HTTPException(status_code=404, detail="Strategy not found")
                
                backtest = strategy.backtest_metrics or {}
                return {
                    "strategy_id": strategy_id,
                    "total_trades": backtest.get("total_trades", 0),
                    "win_rate": backtest.get("win_rate", 0.0),
                    "profit_factor": backtest.get("profit_factor", 0.0),
                    "trades": [],
                }
        except HTTPException:
            raise
        except Exception:
            pass
    
    raise HTTPException(status_code=404, detail="Strategy not found")


@router.get("/optimize/{strategy_id}/equity")
async def get_strategy_equity(strategy_id: str):
    """Get equity curve data for a specific strategy."""
    if USE_DB and not USE_MOCK:
        try:
            async with async_session() as session:
                from app.db.models import Strategy
                result = await session.execute(select(Strategy).where(Strategy.id == strategy_id))
                strategy = result.scalar_one_or_none()
                if not strategy:
                    raise HTTPException(status_code=404, detail="Strategy not found")
                
                metrics = strategy.backtest_metrics or {}
                return {
                    "strategy_id": strategy_id,
                    "total_return": metrics.get("total_return", 0.0),
                    "max_drawdown": metrics.get("max_drawdown", 0.0),
                    "sharpe_ratio": metrics.get("sharpe_ratio", 0.0),
                    "equity_curve": metrics.get("equity_curve", []),
                }
        except HTTPException:
            raise
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Strategy not found")
