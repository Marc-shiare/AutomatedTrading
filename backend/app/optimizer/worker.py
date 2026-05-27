"""Celery worker for running strategy optimization tasks asynchronously."""

import logging
import os
from typing import Dict, Any, Optional
from datetime import datetime
from uuid import uuid4

from celery import Celery, Task
from sqlalchemy import select

from app.db.database import async_session
from app.db.models import OptimizerRun, Strategy
from app.optimizer.engine import optimize
from app.strategies import MomentumBreakoutStrategy, RsiReversalStrategy, MacdCrossoverStrategy

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

app = Celery(
    "trading_optimizer",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.optimizer.worker"],
)

app.conf.update(
    result_expires=3600,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

STRATEGY_MAP = {
    "momentum": MomentumBreakoutStrategy,
    "rsi": RsiReversalStrategy,
    "macd": MacdCrossoverStrategy,
}


def _load_data(symbol: str, timeframe: str = "1d", start: str = None, end: str = None):
    """Fetch OHLCV data for a symbol."""
    from app.data.fetcher import fetch
    df = fetch(symbol, timeframe=timeframe, start=start, end=end)
    if df is None or len(df) < 50:
        raise ValueError(f"Insufficient data for {symbol}: {len(df) if df is not None else 0} rows")
    return df


@app.task(bind=True, max_retries=3)
def run_optimization_task(
    self,
    strategy_type: str,
    symbol: str = "EURUSD=X",
    timeframe: str = "1d",
    n_trials: int = 50,
    timeout: int = 3600,
    param_bounds: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Celery task that runs strategy optimization and persists results to the database.

    Parameters
    ----------
    strategy_type : str
        One of ``momentum``, ``rsi``, ``macd``.
    symbol : str
        Yahoo Finance ticker (default ``EURUSD=X``).
    timeframe : str
        Bar interval (default ``1d``).
    n_trials : int
        Number of Optuna trials (default 50).
    timeout : int
        Stop after ``timeout`` seconds.
    param_bounds : dict
        Override default parameter bounds.

    Returns
    -------
    dict
        ``{task_id, status, best_params, best_score, test_metrics, strategy_id}``
    """
    task_id = self.request.id or str(uuid4())
    logger.info(f"[{task_id}] Starting optimization for {strategy_type} on {symbol}")

    # Mark as running in DB
    _update_optimizer_run(task_id, status="running", progress=0.0)

    try:
        # Load data
        df = _load_data(symbol, timeframe)
        logger.info(f"[{task_id}] Loaded {len(df)} rows for {symbol}")

        # Determine strategy class
        strategy_cls = STRATEGY_MAP.get(strategy_type)
        if strategy_cls is None:
            raise ValueError(f"Unknown strategy: {strategy_type}")

        # Default param bounds if not provided
        if param_bounds is None:
            param_bounds = _default_bounds(strategy_type)

        # Run optimization (this may take minutes)
        logger.info(f"[{task_id}] Running {n_trials} trials...")
        best_params, best_score, result = optimize(
            strategy_cls,
            df,
            param_bounds,
            n_trials=n_trials,
            timeout=timeout,
            n_jobs=-1,
        )

        # Persist to DB
        strategy_id = _persist_strategy_results(
            strategy_type,
            symbol,
            best_params,
            best_score,
            result,
        )

        _update_optimizer_run(
            task_id,
            status="completed",
            progress=1.0,
            current_iteration=n_trials,
            total_iterations=n_trials,
            best_score=best_score,
            parameters=best_params,
        )

        return {
            "task_id": task_id,
            "status": "completed",
            "best_params": best_params,
            "best_score": best_score,
            "test_metrics": result.get("test_metrics", {}),
            "strategy_id": strategy_id,
        }

    except Exception as exc:
        logger.error(f"[{task_id}] Optimization failed: {exc}")
        _update_optimizer_run(task_id, status="failed", progress=0.0)
        self.retry(exc=exc, countdown=60)
        return {
            "task_id": task_id,
            "status": "failed",
            "error": str(exc),
        }


def _default_bounds(strategy_type: str) -> Dict[str, Any]:
    if strategy_type == "momentum":
        return {
            "fast_ma": [5, 20],
            "slow_ma": [25, 60],
            "rsi_period": [10, 30],
            "rsi_overbought": [65, 80],
            "rsi_oversold": [20, 35],
        }
    elif strategy_type == "rsi":
        return {
            "rsi_period": [10, 30],
            "oversold": [20, 35],
            "overbought": [65, 80],
        }
    elif strategy_type == "macd":
        return {
            "fast_ema": [5, 20],
            "slow_ema": [25, 50],
            "signal_ema": [5, 15],
        }
    return {}


def _update_optimizer_run(
    task_id: str,
    status: str,
    progress: float = 0.0,
    current_iteration: int = 0,
    total_iterations: int = 100,
    best_score: float = 0.0,
    parameters: Optional[Dict] = None,
    error: Optional[str] = None,
):
    """Update or create an optimizer_run record in the database."""
    import asyncio
    from app.db.database import async_session
    from app.db.models import OptimizerRun

    async def _update():
        async with async_session() as session:
            result = await session.execute(
                select(OptimizerRun).where(OptimizerRun.id == task_id)
            )
            run = result.scalar_one_or_none()
            if run is None:
                run = OptimizerRun(
                    id=task_id,
                    status=status,
                    progress=progress,
                    current_iteration=current_iteration,
                    total_iterations=total_iterations,
                    best_score=best_score,
                    parameters=parameters or {},
                    started_at=datetime.utcnow(),
                )
                session.add(run)
            else:
                run.status = status
                run.progress = progress
                run.current_iteration = current_iteration
                run.total_iterations = total_iterations
                run.best_score = best_score
                if parameters:
                    run.parameters = parameters
                if status == "completed":
                    run.completed_at = datetime.utcnow()
            await session.commit()

    # Run in existing event loop or create new one
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_update())
    except RuntimeError:
        asyncio.run(_update())


def _persist_strategy_results(
    strategy_type: str,
    symbol: str,
    best_params: Dict[str, Any],
    best_score: float,
    result: Dict[str, Any],
) -> str:
    """Persist optimized strategy to the database and return the strategy ID."""
    import asyncio
    from app.db.database import async_session

    async def _persist():
        async with async_session() as session:
            strategy_id = f"strategy_{strategy_type}_{symbol.replace('=', '').replace('.', '')}_{uuid4().hex[:8]}"

            strategy = Strategy(
                id=strategy_id,
                name=f"{strategy_type.capitalize()} ({symbol})",
                symbol=symbol,
                pair=symbol,
                base_currency=symbol[:3] if len(symbol) >= 6 else "USD",
                quote_currency=symbol[3:6] if len(symbol) >= 6 else "USD",
                composite_score=best_score,
                parameters=best_params,
                backtest_metrics=result.get("test_metrics", {}),
                previous_scores=[],
            )
            session.add(strategy)
            await session.commit()
            return strategy_id

    try:
        loop = asyncio.get_running_loop()
        return asyncio.run_coroutine_threadsafe(_persist(), loop).result()
    except RuntimeError:
        return asyncio.run(_persist())


# ── Celery beat schedule (optional) ──────────────────────────────────────

app.conf.beat_schedule = {
    "weekly-optimization": {
        "task": "app.optimizer.worker.run_optimization_task",
        "schedule": 86400 * 7,  # Weekly
        "args": (),  # No strategy specified
    },
}
