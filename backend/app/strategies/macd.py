"""MACD Crossover Strategy – Signal line crossover with histogram."""

from typing import Dict, Any
import polars as pl
from polars import col, when, lit

from app.strategies.base import BaseStrategy


class MacdCrossoverStrategy(BaseStrategy):
    """MACD crossover strategy generating signals on line/signal crossovers.

    BUY when MACD line crosses above the Signal line
    SELL when MACD line crosses below the Signal line

    Parameters
    ----------
    fast_ema : int
        Period for the fast (shorter) EMA.
    slow_ema : int
        Period for the slow (longer) EMA.
    signal_ema : int
        Period for the signal line EMA.    |
    """

    def __init__(self, df: pl.DataFrame, **params) -> None:
        super().__init__(df)
        self._parameters = {
            "fast_ema": params.get("fast_ema", 12),
            "slow_ema": params.get("slow_ema", 26),
            "signal_ema": params.get("signal_ema", 9),
        }

    @staticmethod
    def _ema(close: pl.Expr, period: int) -> pl.Expr:
        k = 2.0 / (period + 1)
        return close.ewm_mean(alpha=k, adjust=False)

    def generate_signals(self) -> pl.DataFrame:
        p = self._parameters
        ema_fast = self._ema(col("close"), p["fast_ema"])
        ema_slow = self._ema(col("close"), p["slow_ema"])
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm_mean(alpha=2.0 / (p["signal_ema"] + 1), adjust=False)
        histogram = macd_line - signal_line

        # Cross detection: signal line vs MACD line
        signal = (
            when((macd_line > signal_line) & (macd_line.shift(1) <= signal_line.shift(1))).then(lit(1))
            .when((macd_line < signal_line) & (macd_line.shift(1) >= signal_line.shift(1))).then(lit(-1))
            .otherwise(lit(0))
        )

        return self._raw_df.with_columns(
            [
                macd_line.alias("macd_line"),
                signal_line.alias("macd_signal"),
                histogram.alias("macd_histogram"),
                signal.alias("signal"),
            ]
        )

    def get_parameters(self) -> Dict[str, Any]:
        return self._parameters.copy()
