# Self-Optimizing Algorithmic Trading Platform
## MetaTrader 5 (MQL5) Integration

This directory contains the MQL5 Expert Advisor and supporting files for the QuantumTrade self-optimizing trading platform.

## Structure

| Directory | Purpose |
|-----------|---------|
| `Experts/` | MQL5 Expert Advisor (EA) source code |
| `Include/` | MQL5 headers, JSON parser, ZeroMQ library |
| `Config/` | Strategy parameter JSON files |

## Architecture

```
┌──────────────┐     ZeroMQ      ┌────────────────┐
│  FastAPI     │ ←─────────────► │  MQL5 EA       │
│  (Python)    │   (TCP:5555)    │  (MetaTrader 5)│
└──────────────┘                 └────────────────┘
```

## How It Works

1. **FastAPI** sends strategy parameters via ZeroMQ to the MQL5 Expert Advisor
2. **MQL5 EA** executes trades in MetaTrader 5 based on the received parameters
3. **Trade results** are streamed back to FastAPI via ZeroMQ for logging and analysis
4. **Optimizer** runs weekly, updating strategy parameters automatically

## Quick Start

### 1. Prerequisites
- MetaTrader 5 installed
- ZeroMQ library for MQL5: [Download from MQL5.community](https://www.mql5.com/en/code/13082)
- Python `pyzmq` package installed (`pip install pyzmq`)

### 2. Setup
```bash
# Copy ZeroMQ library to MQL5 Include folder
cp -r mt5/Include/Zmq /path/to/MetaTrader5/MQL5/Include/

# Copy Expert Advisor
cp mt5/Experts/QuantumTrade_EA.mq5 /path/to/MetaTrader5/MQL5/Experts/
```

### 3. Compile in MetaEditor
1. Open MetaEditor
2. Navigate to `Experts/QuantumTrade_EA.mq5`
3. Compile (F7)
4. Attach to chart

### 4. Connect to FastAPI
The EA automatically connects to `tcp://localhost:5555` (configurable via input parameters).

## Configuration

Edit `input_` variables in the EA or pass JSON config:

```json
{
  "strategy_name": "momentum_breakout",
  "symbol": "EURUSD",
  "timeframe": "PERIOD_M10",
  "parameters": {
    "fast_ma": 12,
    "slow_ma": 26,
    "rsi_threshold": 65,
    "stop_loss_pips": 25,
    "take_profit_pips": 50,
    "risk_per_trade": 2.0
  }
}
```

## License
Part of QuantumTrade — Self-Optimizing Algorithmic Trading Platform
