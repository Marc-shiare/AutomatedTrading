"""OHLC data fetcher using yfinance with Polars."""

from typing import Optional
from pathlib import Path
import datetime as dt

import polars as pl
import yfinance as yf


CACHE_DIR = Path("__pycache__").parent.parent.parent / "data_cache"
CACHE_DIR.mkdir(exist_ok=True)


def _cache_path(symbol: str, timeframe: str) -> Path:
    safe_symbol = symbol.replace("/", "_")
    return CACHE_DIR / f"{safe_symbol}_{timeframe}.parquet"


def _get_timeframe_str(tf: str) -> str:
    mapping = {
        "1m": "1d",    # yfinance intraday
        "5m": "5d",
        "15m": "15d",
        "30m": "1mo",
        "1h": "1mo",
        "4h": "3mo",
        "1d": "max",
        "1w": "max",
    }
    return mapping.get(tf, "max")


def fetch(
    symbol: str,
    timeframe: str = "1d",
    start: Optional[str] = None,
    end: Optional[str] = None,
    use_cache: bool = True,
) -> Optional[pl.DataFrame]:
    """Fetch OHLCV data from yfinance and return a Polars DataFrame.

    Parameters
    ----------
    symbol : str
        Ticker symbol, e.g. ``EURUSD=X`` for forex or ``AAPL`` for stocks.
    timeframe : str, optional
        Bar interval: ``1m``, ``5m``, ``15m``, ``30m``, ``1h``, ``4h``, ``1d``
        (default ``1d``).
    start : str, optional
        Start date ``YYYY-MM-DD`` (defaults to 3 years ago).
    end : str, optional
        End date ``YYYY-MM-DD`` (defaults to today).
    use_cache : bool, optional
        Read/write local parquet cache (default True).

    Returns
    -------
    pl.DataFrame | None
        DataFrame with columns ``timestamp, open, high, low, close, volume``
        or ``None`` if download fails.
    """
    cache_path = _cache_path(symbol, timeframe)

    # Try cache first
    if use_cache and cache_path.exists():
        return pl.read_parquet(cache_path)

    # Download from yfinance
    try:
        ticker = yf.Ticker(symbol)
        period = _get_timeframe_str(timeframe)
        hist = ticker.history(period=period, interval=timeframe)

        if hist.empty:
            return None

        # Rename and select
        df = (
            pl.DataFrame(hist.reset_index())
            .rename(
                {
                    "Date": "timestamp",
                    "Datetime": "timestamp",
                    "Open": "open",
                    "High": "high",
                    "Low": "low",
                    "Close": "close",
                    "Volume": "volume",
                }
            )
            .select(["timestamp", "open", "high", "low", "close", "volume"])
        )

        # Filter by date if provided
        if start and end:
            start_dt = dt.datetime.strptime(start, "%Y-%m-%d")
            end_dt = dt.datetime.strptime(end, "%Y-%m-%d") + dt.timedelta(days=1)
            df = df.filter(
                (pl.col("timestamp") >= start_dt) & (pl.col("timestamp") < end_dt)
            )
        elif start:
            start_dt = dt.datetime.strptime(start, "%Y-%m-%d")
            df = df.filter(pl.col("timestamp") >= start_dt)
        elif end:
            end_dt = dt.datetime.strptime(end, "%Y-%m-%d") + dt.timedelta(days=1)
            df = df.filter(pl.col("timestamp") < end_dt)

        # Cache
        if use_cache:
            df.write_parquet(cache_path)

        return df
    except Exception:
        return None


def fetch_forex_pair(
    pair: str,
    timeframe: str = "1d",
    start: Optional[str] = None,
    end: Optional[str] = None,
    use_cache: bool = True,
) -> Optional[pl.DataFrame]:
    """Fetch forex pair data (appends ``=X`` to symbol)."""
    return fetch(f"{pair}=X", timeframe, start, end, use_cache)
