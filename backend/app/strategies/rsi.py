"""RSI Reversal Strategy – Buy oversold, sell overbought."""

from typing import Dict, Any
import polars as pl
from polars import col, when, lit

from app.strategies.base import BaseStrategy


class RsiReversalStrategy(BaseStrategy):
    """Mean-reversion strategy based on the Relative Strength Index (RSI).

    BUY when RSI crosses above the *oversold* threshold from below.
    SELL when RSI crosses below the *overbought* threshold from above.

    Parameters
    ----------
    rsi_period : int
        Look-back period for RSI calculation.
    oversold : float
        Threshold below which the market is considered oversold.
    overbought : float
        Threshold above which the market is considered overbought.
    """

    def __init__(self, df: pl.DataFrame, **params) -> None:
        super().__init__(df)
        self._parameters = {
            "rsi_period": params.get("rsi_period", 14),
            "oversold": params.get("oversold", 30.0),
            "overbought": params.get("overbought", 70.0),
        }

    @staticmethod
    def _compute_rsi(close: pl.Expr, period: int) -> pl.Expr:
        delta = close.diff()
        gain = when(delta > 0).then(delta).otherwise(lit(0.0))
        loss = when(delta < 0).then(-delta).otherwise(lit(0.0))
        avg_gain = gain.rolling_mean(window_size=period, min_periods=period)
        avg_loss = loss.rolling_mean(window_size=period, min_periods=period)
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def generate_signals(self) -> pl.DataFrame:
        p = self._parameters
        rsi = self._compute_rsi(col("close"), p["rsi_period"])

        # Cross detections using lagged values
        rsi_prev = rsi.shift(1)
        crossover_buy = (rsi > p["oversold"]) & (rsi_prev <= p["oversold"])
        crossover_sell = (rsi < p["overbought"]) & (rsi_prev >= p["overbought"])

        signal = (
            when(crossover_buy).then(lit(1))
            .when(crossover_sell).then(lit(-1))
            .otherwise(lit(0))
        )

        return self._raw_df.with_columns(
            [
                rsi.alias("rsi"),
                signal.alias("signal"),
            ]
        )

    def get_parameters(self) -> Dict[str, Any]:
        return self._parameters.copy()
