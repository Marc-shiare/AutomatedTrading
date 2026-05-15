import random
from datetime import datetime, timedelta


def generate_mock_strategies(count=6):
    symbols = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD"]
    names = [
        "Momentum Breakout (10min)",
        "RSI Reversal (15min)",
        "MACD Cross (5min)",
        "Bollinger Squeeze (1H)",
        "Trend Follow (30min)",
        "Mean Reversion (5min)",
    ]
    strategies = []
    for i in range(count):
        win_rate = round(random.uniform(0.45, 0.72), 2)
        profit_factor = round(random.uniform(1.1, 2.8), 2)
        max_drawdown = round(random.uniform(0.08, 0.25), 2)
        sharpe = round(random.uniform(0.8, 2.5), 2)
        return_pct = round(random.uniform(5, 45), 1)
        composite = round(profit_factor * (1 - max_drawdown), 2)

        strategies.append(
            {
                "id": f"strategy_{i+1:03d}",
                "name": names[i % len(names)],
                "symbol": symbols[i % len(symbols)],
                "optimization_date": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                "parameters": {
                    "fast_ma": random.randint(5, 20),
                    "slow_ma": random.randint(25, 60),
                    "rsi_threshold": random.randint(55, 75),
                    "stop_loss_pips": random.randint(15, 50),
                    "risk_per_trade": round(random.uniform(1, 3), 1),
                },
                "backtest_metrics": {
                    "total_trades": random.randint(80, 200),
                    "win_rate": win_rate,
                    "profit_factor": profit_factor,
                    "max_drawdown": max_drawdown,
                    "sharpe_ratio": sharpe,
                    "return_percent": return_pct,
                },
                "composite_score": composite,
                "status": "deployed" if i < 3 else "ready_for_deployment",
                "previous_scores": [
                    round(composite - random.uniform(0.05, 0.15), 2),
                    round(composite - random.uniform(0.1, 0.2), 2),
                    round(composite + random.uniform(0.02, 0.08), 2),
                ],
            }
        )
    return strategies


def generate_mock_positions(count=4):
    symbols = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"]
    positions = []
    for i in range(count):
        side = "BUY" if random.random() > 0.5 else "SELL"
        entry_price = round(random.uniform(1.05, 1.25), 4)
        current_price = round(entry_price + (random.uniform(-0.005, 0.015) if side == "BUY" else random.uniform(-0.015, 0.005)), 4)
        unrealized = round((current_price - entry_price) * 100000, 2)

        positions.append(
            {
                "symbol": symbols[i % len(symbols)],
                "strategy_id": f"strategy_{(i % 6) + 1:03d}",
                "side": side,
                "current_size": round(random.uniform(0.2, 1.0), 2),
                "entry_price": entry_price,
                "current_price": current_price,
                "unrealized_pnl": unrealized,
                "risk_level": random.choice(["low", "normal", "high"]),
                "max_daily_drawdown_used": round(random.uniform(0.02, 0.08), 3),
                "max_daily_drawdown_limit": 0.1,
                "timestamp": datetime.now().isoformat(),
            }
        )
    return positions


def generate_mock_dashboard_summary():
    return {
        "total_pnl": round(random.uniform(1250, 8500), 2),
        "win_rate": round(random.uniform(0.52, 0.68), 2),
        "sharpe_ratio": round(random.uniform(1.2, 2.2), 2),
        "max_drawdown": round(random.uniform(0.08, 0.18), 2),
        "active_strategies": random.randint(3, 6),
        "total_trades_today": random.randint(5, 25),
    }


def generate_mock_optimizer_state():
    return {
        "status": "idle",
        "progress": 0.0,
        "current_iteration": 0,
        "total_iterations": 500000,
        "best_score": 0.0,
        "eta_seconds": 0,
    }


def generate_mock_news(count=5):
    events = [
        {"title": "US Non-Farm Payrolls", "impact": "high", "currency": "USD"},
        {"title": "ECB Interest Rate Decision", "impact": "high", "currency": "EUR"},
        {"title": "UK CPI Data Release", "impact": "medium", "currency": "GBP"},
        {"title": "FOMC Meeting Minutes", "impact": "high", "currency": "USD"},
        {"title": "Japan GDP Report", "impact": "medium", "currency": "JPY"},
        {"title": "Australia Employment Data", "impact": "medium", "currency": "AUD"},
        {"title": "Canada Retail Sales", "impact": "low", "currency": "CAD"},
    ]

    news = []
    for i in range(count):
        event = events[i % len(events)]
        news.append(
            {
                "id": f"news_{i+1:03d}",
                "title": event["title"],
                "impact": event["impact"],
                "scheduled_time": (datetime.now() + timedelta(hours=random.randint(1, 72))).isoformat(),
                "currency": event["currency"],
            }
        )
    return news
