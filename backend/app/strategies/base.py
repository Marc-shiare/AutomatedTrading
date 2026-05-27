"""Abstract base class for all trading strategies."""

from abc import ABC, abstractmethod
from typing import Dict, Any
import polars as pl


class BaseStrategy(ABC):
    """Abstract base class for trading strategies.

    Expected columns in input DataFrame:
        - timestamp: datetime (or date) column
        - open: float
        - high: float
        - low: float
        - close: float
        - volume: int/float (optional)

    Subclasses must implement `generate_signals()` which returns a Polars
    DataFrame with the same columns plus a `signal` column (1=BUY, -1=SELL,
    0=HOLD).
    """

    def __init__(self, df: pl.DataFrame) -> None:
        """Initialize strategy with OHLCV data.

        Args:
            df: Polars DataFrame with at least [timestamp, open, high,
                low, close, volume] columns.
        """
        self._raw_df = df.clone()
        self._parameters: Dict[str, Any] = {}

    @property
    def df(self) -> pl.DataFrame:
        """Read-only access to the raw OHLCV DataFrame."""
        return self._raw_df

    # ------------------------------------------------------------------ #
    # Abstract interface
    # ------------------------------------------------------------------ #

    @abstractmethod
    def generate_signals(self) -> pl.DataFrame:
        """Generate trading signals from the OHLCV data.

        Must return a Polars DataFrame containing all original columns plus
        a ``signal`` column with values:
            1  → BUY
            -1 → SELL
            0  → HOLD / no action
        """
        ...

    @abstractmethod
    def get_parameters(self) -> Dict[str, Any]:
        """Return the current strategy parameter values."""
        ...
