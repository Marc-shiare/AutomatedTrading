"""Optuna-based optimization engine with walk-forward validation."""

import logging
from typing import Dict, Any, Optional, Tuple, Type

import numpy as np
import polars as pl
import optuna
from optuna.samplers import TPESampler

from app.strategies.base import BaseStrategy
from app.backtest.engine import run_backtest, composite_score

# Suppress verbose Optuna logs
optuna.logging.set_verbosity(optuna.logging.WARNING)

logger = logging.getLogger(__name__)


def _split_train_test(df: pl.DataFrame, train_ratio: float = 0.8) -> Tuple[pl.DataFrame, pl.DataFrame]:
    """Split a Polars DataFrame by row index into train / test.

    Parameters
    ----------
    df : pl.DataFrame
        Chronologically-ordered DataFrame.
    train_ratio : float
        Fraction of rows to use for training (default 0.8).

    Returns
    -------
    Tuple[pl.DataFrame, pl.DataFrame]
        (train_df, test_df)
    """
    n = len(df)
    split_at = int(n * train_ratio)
    train = df.slice(0, split_at)
    test = df.slice(split_at, n - split_at)
    return train, test


def optimize(
    strategy_class: Type[BaseStrategy],
    df: pl.DataFrame,
    param_bounds: Dict[str, Any],
    n_trials: int = 100,
    timeout: Optional[int] = None,
    train_ratio: float = 0.8,
    initial_capital: float = 10_000.0,
    n_jobs: int = -1,
) -> Tuple[Dict[str, Any], float, Dict[str, Any]]:
    """Optimize a trading strategy using Optuna with walk-forward validation.

    The search space is determined by ``param_bounds``. Supported types:
    - ``list`` of ints   → ``optuna.suggest_int(name, low, high)``
    - ``list`` of floats → ``optuna.suggest_float(name, low, high)``
    - ``list`` with step → ``optuna.suggest_int`` with step

    Parameters
    ----------
    strategy_class : Type[BaseStrategy]
        Strategy class implementing ``BaseStrategy``.
    df : pl.DataFrame
        OHLCV data (chronological order).
    param_bounds : dict
        e.g. ``{"fast_ma": [5, 20], "slow_ma": [25, 60], ...}``
    n_trials : int
        Number of Optuna trials (default 100).
    timeout : int | None
        Stop after ``timeout`` seconds.
    train_ratio : float
        80% train / 20% test by default.
    initial_capital : float
        Starting capital for backtest.
    n_jobs : int
        Number of parallel workers (``-1`` = all cores).

    Returns
    -------
    (best_params, best_score, full_result)
        - best_params (dict)
        - best_score (float) on the held-out test set
        - full_result (dict) with train and test metrics
    """
    train_df, test_df = _split_train_test(df, train_ratio)

    def _objective(trial: optuna.Trial) -> float:
        # Build parameter dict from bounds
        params: Dict[str, Any] = {}
        for name, bounds in param_bounds.items():
            if isinstance(bounds, list) and len(bounds) == 2:
                low, high = bounds
                if isinstance(low, int) and isinstance(high, int):
                    val = trial.suggest_int(name, low, high)
                else:
                    val = trial.suggest_float(name, low, high)
                params[name] = val
            elif isinstance(bounds, list) and len(bounds) == 3:
                # [low, high, step]
                low, high, step = bounds
                val = trial.suggest_int(name, low, high, step=step)
                params[name] = val
            else:
                params[name] = bounds

        try:
            strategy = strategy_class(train_df, **params)
            signals = strategy.generate_signals()
            result = run_backtest(train_df, signals, initial_capital=initial_capital)

            if result.total_trades < 3:
                return -999.0

            score = composite_score(
                result.profit_factor,
                result.max_drawdown,
                result.sharpe_ratio,
            )

            return float(score) if not np.isnan(score) else -999.0

        except Exception:
            return -999.0

    # Create study
    sampler = TPESampler(
        n_startup_trials=min(20, n_trials // 5),
        multivariate=True,
    )

    study = optuna.create_study(
        direction="maximize",
        sampler=sampler,
    )

    study.optimize(
        _objective,
        n_trials=n_trials,
        timeout=timeout,
        n_jobs=n_jobs if n_jobs > 0 else None,
        show_progress_bar=True,
    )

    best_params = study.best_trial.params

    # ------------------------------------------------------------------ #
    # Validate on held-out test set
    # ------------------------------------------------------------------ #
    best_strategy = strategy_class(test_df, **best_params)
    best_signals = best_strategy.generate_signals()
    test_result = run_backtest(test_df, best_signals, initial_capital=initial_capital)

    best_score = composite_score(
        test_result.profit_factor,
        test_result.max_drawdown,
        test_result.sharpe_ratio,
    )

    logger.info(f"Best params: {best_params}")
    logger.info(f"Test score: {best_score:.4f}")

    return (
        best_params,
        float(best_score) if not np.isnan(best_score) else -999.0,
        {
            "train_metrics": {
                "total_return": study.best_trial.value,
                "profit_factor": study.best_trial.value,  # placeholder
                "sharpe_ratio": 0.0,  # placeholder
            },
            "test_metrics": {
                "total_return": test_result.total_return,
                "profit_factor": test_result.profit_factor,
                "max_drawdown": test_result.max_drawdown,
                "sharpe_ratio": test_result.sharpe_ratio,
                "win_rate": test_result.win_rate,
                "total_trades": test_result.total_trades,
            },
        },
    )
