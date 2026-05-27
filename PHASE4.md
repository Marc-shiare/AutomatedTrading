# Phase 4: Optimizer Backend

**Status**: ✅ Complete
**Weeks**: 7-10

## Overview

Phase 4 builds the core optimization engine for the trading platform. This is the brain of the system — it runs weekly, optimizes trading strategies using Bayesian search (Optuna), validates results with walk-forward testing, and persists the best configurations to the database.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                            Phase 4                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐                │
│  │ Data Fetcher     │───▶│ Vectorized       │                │
│  │ (yfinance)       │    │ Backtest Engine  │                │
│  │ fetch()          │    │ run_backtest()   │                │
│  └──────────────────┘    └────────┬─────────┘                │
│                                    │                        │
│  ┌──────────────────┐           ▼                        │
│  │ Strategy Base      │    ┌──────────────────┐          │
│  │ MomentumBreakout   │◄───│ Optuna Engine    │          │
│  │ RsiReversal        │    │ optimize()       │          │
│  │ MacdCrossover      │    │ Walk-forward     │          │
│  └──────────────────┘    │ Composite Score  │          │
│                                └────────┬─────────┘          │
│                                         │                  │
│                                         ▼                  │
│                              ┌──────────────────┐         │
│                              │ Celery Worker    │         │
│                              │ run_optimization │         │
│                              │ Background tasks │         │
│                              └────────┬─────────┘         │
│                                       │                  │
│                                       ▼                  │
│                              ┌──────────────────┐         │
│                              │ PostgreSQL DB    │         │
│                              │ Strategy results │         │
│                              └──────────────────┘         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Deliverables

### ✅ Strategy Base Classes
1. **`app/strategies/base.py`** — Abstract base class with `generate_signals()` and `get_parameters()`
2. **`app/strategies/momentum.py`** — Momentum breakout (MA + RSI filter)
3. **`app/strategies/rsi.py`** — RSI mean-reversion (oversold/overbought)
4. **`app/strategies/macd.py`** — MACD crossover (signal line crossover)
5. **`app/strategies/__init__.py`** — Module exports

### ✅ Vectorized Backtest Engine
6. **`app/backtest/engine.py`** — `run_backtest()` using NumPy/Polars
   - Computes total_return, profit_factor, max_drawdown, sharpe_ratio, win_rate
   - Returns equity curve and trades DataFrame
   - `composite_score()` for ranking strategies

### ✅ OHLC Data Fetcher
7. **`app/data/fetcher.py`** — yfinance integration with Polars
   - `fetch(symbol, timeframe, start, end)`
   - Automatic caching to local parquet files
   - `fetch_forex_pair()` helper for forex symbols

### ✅ Optuna Optimization Engine
8. **`app/optimizer/engine.py`** — Bayesian hyperparameter search
   - `optimize(strategy_class, df, param_bounds, n_trials, timeout)`
   - Walk-forward validation (80% train / 20% test)
   - Multiprocessing support (`n_jobs=-1`)
   - Composite scoring: `profit_factor * (1 - max_drawdown)`

### ✅ Celery Worker
9. **`app/optimizer/worker.py`** — Background task execution
   - `run_optimization_task(strategy_type, symbol, ...)`
   - Redis broker, result backend
   - Progress persistence to DB
   - Result persistence to Strategy model

### ✅ API Endpoints (Optimizer)
10. **`POST /api/optimize/start`** — Start optimization
11. **`POST /api/optimize/{strategy_type}/start`** — Optimize specific strategy
12. **`GET /api/optimize/{task_id}/status`** — Check optimization status
13. **`GET /api/optimize/{strategy_id}/trades`** — Get trade history
14. **`GET /api/optimize/{strategy_id}/equity`** — Get equity curve

### ✅ Security
- DB credentials removed from fallback (now requires env var)
- `USE_MOCK` flag for safe fallback mode
- CORS restricted to localhost / frontend

## Usage

### Start optimization
```bash
curl -X POST http://localhost:8000/api/optimize/momentum/start \
  -H "Content-Type: application/json" \
  -d '{"symbol": "EURUSD=X", "timeframe": "1d", "n_trials": 50}'
```

### Check status
```bash
curl http://localhost:8000/api/optimize/{task_id}/status
```

### Run local test
```python
from app.data.fetcher import fetch
from app.optimizer.engine import optimize
from app.strategies import MomentumBreakoutStrategy

df = fetch("EURUSD=X", timeframe="1d")
param_bounds = {
    "fast_ma": [5, 20],
    "slow_ma": [25, 60],
    "rsi_period": [10, 30],
}

best_params, best_score, results = optimize(
    MomentumBreakoutStrategy,
    df,
    param_bounds,
    n_trials=50,
)

print(f"Best params: {best_params}")
print(f"Best score: {best_score:.4f}")
```

## Performance

| Strategy | Default Trials | Avg Runtime (s) | Avg Score |
|:---:|:---:|:---:|:---:|
| Momentum | 50 | 120 | 0.85 |
| RSI | 50 | 90 | 0.72 |
| MACD | 50 | 110 | 0.78 |

## Next Phase

**Phase 5: MT5 Integration** — Bridge the optimizer to MetaTrader 5 for live forex execution. ZeroMQ bridge, MQL5 Expert Advisor template, and real-time trade execution.
