"""Vectorized backtest engine using NumPy/Polars.

This module provides a high-performance, fully vectorized backtest engine
for evaluating trading strategies on OHLCV data.

Example
-------
>>> import polars as pl
>>> from app.strategies.momentum import MomentumBreakoutStrategy
>>> from app.backtest.engine import run_backtest

>>> df = pl.DataFrame({...})  # OHLCV data
>>> strategy = MomentumBreakoutStrategy(df)
>>> signals = strategy.generate_signals()
>>> result = run_backtest(df, signals)
>>> print(result["total_return"])
0.156
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field

import numpy as np
import polars as pl
from polars import col, when, lit, DataFrame, Expr


@dataclass
class BacktestResult:
    """Container for backtest results."""

    total_return: float
    profit_factor: float
    max_drawdown: float
    sharpe_ratio: float
    win_rate: float
    total_trades: int
    equity_curve: np.ndarray
    trades_df: pl.DataFrame
    metrics: Dict = field(default_factory=dict)


def run_backtest(
    df: pl.DataFrame,
    signals: pl.DataFrame,
    initial_capital: float = 10_000.0,
    spread_pct: float = 0.0001,
) -> BacktestResult:
    """Run a fully vectorized backtest on a signals DataFrame.    
    Parameters
    ----------
    df : pl.DataFrame
        OHLCV data with [timestamp, open, high, low, close, volume].
    signals : pl.DataFrame
        Output from ``strategy.generate_signals()`` containing a ``signal``
        column (1=BUY, -1=SELL, 0=HOLD).
    initial_capital : float, optional
        Starting capital (default 10_000).
    spread_pct : float, optional
        Bid/ask spread as a fraction of price, e.g. 0.0001 = 1 pip
        (default 0.0001).

    Returns
    -------
    BacktestResult
        Dataclass with return, drawdown, sharpe, win_rate, etc.
    """
    # ------------------------------------------------------------------ #
    # Merge signals back into OHLCV to keep rows aligned
    # ------------------------------------------------------------------ #
    merged = df.join(
        signals.select(["timestamp", "signal"]),
        on="timestamp",
        how="left",
    ).with_columns(col("signal").fill_null(0))

    close = merged["close"].to_numpy()
    signal = merged["signal"].to_numpy()
    n = len(close)

    # ------------------------------------------------------------------ #
    # Build position array: 1 = long, -1 = short, 0 = flat
    # Position changes only on signal transitions
    # ------------------------------------------------------------------ #
    position = np.zeros(n, dtype=np.int8)
    current_pos = 0
    for i in range(n):
        if signal[i] == 1:
            current_pos = 1
        elif signal[i] == -1:
            current_pos = -1
        position[i] = current_pos

    # ------------------------------------------------------------------ #
    # Entry / exit points
    # ------------------------------------------------------------------ #
    # Detect where we enter/exit a position
    pos_change = np.diff(position, prepend=0)
    entry_mask = (pos_change != 0) & (position != 0)
    exit_mask = (pos_change != 0) & (np.roll(position, 1) != 0)

    # ------------------------------------------------------------------ #
    # P&L calculation per bar
    # ------------------------------------------------------------------ #
    price_returns = np.diff(close, prepend=close[0]) / np.maximum(close, 1e-8)
    trade_pnl = position * price_returns

    # Spread cost on entry only
    spread_cost = np.zeros(n)
    spread_cost[entry_mask] = spread_pct

    net_pnl = trade_pnl - spread_cost
    cumulative = np.cumsum(net_pnl)

    # Equity curve
    equity = initial_capital * (1 + cumulative)

    # ------------------------------------------------------------------ #
    # Metrics
    # ------------------------------------------------------------------ #
    total_return = (equity[-1] - initial_capital) / initial_capital

    # Profit factor
    gross_profits = np.sum(np.maximum(net_pnl, 0))
    gross_losses = np.sum(np.abs(np.minimum(net_pnl, 0)))
    profit_factor = gross_profits / gross_losses if gross_losses > 0 else float("inf")

    # Max drawdown
    rolling_max = np.maximum.accumulate(equity)
    drawdown = (rolling_max - equity) / rolling_max
    max_drawdown = float(np.max(drawdown))

    # Sharpe ratio (daily)
    daily_returns = np.diff(equity) / np.maximum(equity[:-1], 1e-8)
    sharpe_ratio = (
        np.mean(daily_returns) / np.std(daily_returns) * np.sqrt(252)
        if np.std(daily_returns) > 0
        else 0.0
    )

    # Win rate (per-trade)
    trade_returns = np.diff(equity)[entry_mask[1:]]  # only where we have entries
    win_rate = float(np.sum(trade_returns > 0) / len(trade_returns)) if len(trade_returns) > 0 else 0.0

    # Build trades DataFrame
    entry_indices = np.where(entry_mask)[0]
    exit_indices = np.where(exit_mask)[0]

    trades_data = {
        "entry_timestamp": [str(merged["timestamp"][int(i)]) for i in entry_indices],
        "exit_timestamp": [str(merged["timestamp"][int(i)]) for i in exit_indices if i < n],
        "entry_price": close[entry_indices].tolist(),
        "exit_price": close[exit_indices].tolist() if len(exit_indices) > 0 else [],
        "side": ["BUY" if position[int(i)] == 1 else "SELL" for i in entry_indices],
        "pnl": (equity[exit_indices] - equity[entry_indices]).tolist() if len(exit_indices) > 0 else [],
    }

    trades_df = pl.DataFrame(trades_data) if len(entry_indices) > 0 else pl.DataFrame()

    # ------------------------------------------------------------------ #
    # Return
    # ------------------------------------------------------------------ #
    return BacktestResult(
        total_return=float(total_return),
        profit_factor=float(profit_factor),
        max_drawdown=max_drawdown,
        sharpe_ratio=float(sharpe_ratio),
        win_rate=win_rate,
        total_trades=len(entry_indices),
        equity_curve=equity,
        trades_df=trades_df,
        metrics={
            "initial_capital": initial_capital,
            "final_capital": float(equity[-1]),
            "gross_profits": float(gross_profits),
            "gross_losses": float(gross_losses),
            "avg_trade_pnl": float(np.mean(np.abs(trade_pnl[trade_pnl != 0]))) if len(trade_pnl[trade_pnl != 0]) > 0 else 0.0,
            "total_bars": n,
        },
    )


def composite_score(
    profit_factor: float,
    max_drawdown: float,
    sharpe_ratio: float,
    weights: Optional[Dict[str, float]] = None,
) -> float:
    """Compute weighted composite score from backtest metrics.

    Default formula::

        score = profit_factor * (1 - max_drawdown) * max(0, sharpe_ratio)

    Parameters
    ----------
    profit_factor : float
        Gross profit / gross loss.
    max_drawdown : float
        Maximum peak-to-trough drawdown (0.0 – 1.0).
    sharpe_ratio : float
        Annualized Sharpe ratio.
    weights : dict, optional
        Override default weights, keys: ``pf``, ``dd``, ``sharpe``.

    Returns
    -------
    float
        Composite score (higher is better).
    """
    w = weights or {"pf": 0.45, "dd": 0.35, "sharpe": 0.20}
    pf_term = profit_factor ** w["pf"]
    dd_term = (1 - max_drawdown) ** w["dd"]
    sharpe_term = max(0, sharpe_ratio) ** w["sharpe"]
    return pf_term * dd_term * sharpe_term
