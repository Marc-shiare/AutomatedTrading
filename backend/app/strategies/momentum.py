"""Momentum Breakout Strategy – Moving Average + RSI filter."""

from typing import Dict, Any
import polars as pl
from polars import col, when, lit

from app.strategies.base import BaseStrategy


class MomentumBreakoutStrategy(BaseStrategy):
    """Momentum breakout using fast/slow MA crossover with RSI confirmation.

    Parameters
    ----------
    fast_ma : int
        Look-back period for the fast moving average.
    slow_ma : int
        Look-back period for the slow moving average.
    rsi_period : int
        Look-back for RSI calculation.
    rsi_overbought : float
        Thresh-old above which the market is considered overbought.
    rsi_oversold : float
        Threshold below which the market is considered oversold.
    """

    def __init__(self, df: pl.DataFrame, **params) -> None:
        super().__init__(df)
        self._parameters = {
            "fast_ma": params.get("fast_ma", 12),
            "slow_ma": params.get("slow_ma", 26),
            "rsi_period": params.get("rsi_period", 14),
            "rsi_overbought": params.get("rsi_overbought", 70.0),
            "rsi_oversold": params.get("rsi_oversold", 30.0),
        }

    # ------------------------------------------------------------------ #
    # Parameter helpers
    # ------------------------------------------------------------------ #

    def _compute_rsi(self, close: pl.Expr, period: int) -> pl.Expr:
        delta = close.diff()
        gain = when(delta > 0).then(delta).otherwise(lit(0.0))
        loss = when(delta < 0).then(-delta).otherwise(lit(0.0))
        avg_gain = gain.rolling_mean(window_size=period, min_periods=period)
        avg_loss = loss.rolling_mean(window_size=period, min_periods=period)
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    # ------------------------------------------------------------------ #
    # Core logic
    # ------------------------------------------------------------------ #

    def generate_signals(self) -> pl.DataFrame:
        p = self._parameters

        fast = col("close").rolling_mean(window_size=p["fast_ma"], min_periods=p["fast_ma"])
        slow = col("close").rolling_mean(window_size=p["slow_ma"], min_periods=p["slow_ma"])
        rsi = self._compute_rsi(col("close"), p["rsi_period"])

        crossover_buy = (fast > slow) & (fast.shift(1) <= slow.shift(1))
        crossover_sell = (fast < slow) & (fast.shift(1) >= slow.shift(1))

        signal = (
            when(crossover_buy & (rsi < p["rsi_overbought"])).then(lit(1))
            .when(crossover_sell & (rsi > p["rsi_oversold"])).then(lit(-1))
            .otherwise(lit(0))
        )

        return self._raw_df.with_columns(
            [
                fast.alias("fast_ma"),
                slow.alias("slow_ma"),
                rsi.alias("rsi"),
                signal.alias("signal"),
            ]
        )

    def get_parameters(self) -> Dict[str, Any]:
        return self._parameters.copy()
