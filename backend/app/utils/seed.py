"""Seed script to populate the database with realistic mock data.

Usage:
    cd backend && python -m app.utils.seed
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from uuid import uuid4

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.database import engine
from app.db.models import (
    Base,
    Strategy,
    Trade,
    Position,
    OptimizerRun,
    NewsEvent,
    StrategyStatus,
    TradeSide,
    TradeStatus,
    RiskLevel,
    NewsImpact,
)
from sqlalchemy import func


PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"]
STRATEGY_NAMES = [
    "Momentum Breakout (10min)",
    "RSI Reversal (15min)",
    "MACD Cross (5min)",
    "Bollinger Squeeze (1H)",
    "Trend Follow (30min)",
]


def random_float(min_val: float, max_val: float, decimals: int = 2) -> float:
    val = min_val + (max_val - min_val) * (hash(str(uuid4())) % 10000) / 10000
    return round(val, decimals)


def random_int(min_val: int, max_val: int) -> int:
    return min_val + hash(str(uuid4())) % (max_val - min_val + 1)


async def seed_strategies(session) -> list[Strategy]:
    strategies = []
    for i, name in enumerate(STRATEGY_NAMES):
        pair = PAIRS[i % len(PAIRS)]
        win_rate = random_float(0.45, 0.72, 2)
        profit_factor = random_float(1.1, 2.8, 2)
        max_drawdown = random_float(0.08, 0.25, 2)
        sharpe = random_float(0.8, 2.5, 2)
        composite = round(profit_factor * (1 - max_drawdown), 2)
        
        strategy = Strategy(
            id=f"strategy_{i+1:03d}",
            name=name,
            symbol=pair,
            pair=pair,
            base_currency=pair[:3],
            quote_currency=pair[3:],
            optimization_date=datetime.utcnow() - timedelta(days=random_int(1, 30)),
            composite_score=composite,
            status=StrategyStatus.deployed if i < 3 else StrategyStatus.ready,
            previous_scores=[
                max(0, composite - random_float(0.05, 0.15, 2)),
                max(0, composite - random_float(0.1, 0.2, 2)),
                max(0, composite + random_float(0.02, 0.08, 2)),
            ],
            parameters={
                "fast_ma": random_int(5, 20),
                "slow_ma": random_int(25, 60),
                "rsi_threshold": random_int(55, 75),
                "stop_loss_pips": random_int(15, 50),
                "take_profit_pips": random_int(30, 100),
                "risk_per_trade": random_float(1, 3, 1),
            },
            backtest_metrics={
                "total_trades": random_int(80, 200),
                "win_rate": win_rate,
                "profit_factor": profit_factor,
                "max_drawdown": max_drawdown,
                "sharpe_ratio": sharpe,
                "return_percent": random_float(5, 45, 1),
            },
        )
        strategies.append(strategy)
        session.add(strategy)

    await session.commit()
    return strategies


async def seed_trades(session, strategies: list[Strategy]):
    for i in range(20):
        strategy = strategies[i % len(strategies)]
        pair = strategy.pair
        side = TradeSide.buy if i % 2 == 0 else TradeSide.sell
        entry_price = random_float(1.05, 1.25, 4)
        lot_size = random_float(0.1, 1.0, 2)
        pnl_pips = random_float(-25, 30, 2)
        pnl = round(pnl_pips * 10 * lot_size, 2)
        
        trade = Trade(
            id=f"trade_{i+1:03d}",
            strategy_id=strategy.id,
            symbol=pair,
            pair=pair,
            side=side,
            entry_time=datetime.utcnow() - timedelta(hours=random_int(1, 72)),
            entry_price=entry_price,
            exit_time=datetime.utcnow() - timedelta(hours=random_int(0, 24)) if i % 3 != 0 else None,
            exit_price=entry_price + random_float(-0.01, 0.01, 4) if i % 3 != 0 else None,
            lot_size=lot_size,
            position_size=lot_size,
            pnl=pnl,
            pnl_pips=pnl_pips,
            pnl_percent=random_float(-1.5, 3.5, 3),
            risk_reward_ratio=random_float(1.0, 3.5, 1),
            spread_pips=random_float(0.2, 1.5, 1),
            commission=random_float(5, 10, 2),
            status=TradeStatus.closed if i % 3 != 0 else TradeStatus.open,
        )
        session.add(trade)

    await session.commit()


async def seed_positions(session, strategies: list[Strategy]):
    for i in range(4):
        strategy = strategies[i % len(strategies)]
        pair = strategy.pair
        side = TradeSide.buy if i % 2 == 0 else TradeSide.sell
        entry_price = random_float(1.05, 1.25, 4)
        current_price = entry_price + random_float(-0.005, 0.015, 4)
        price_diff = current_price - entry_price
        pips = price_diff / 0.0001
        lot_size = random_float(0.2, 1.0, 2)
        
        position = Position(
            symbol=pair,
            pair=pair,
            strategy_id=strategy.id,
            side=side,
            current_lot_size=lot_size,
            entry_price=entry_price,
            current_price=current_price,
            unrealized_pnl=round(pips * 0.0001 * 100000 * lot_size, 2),
            unrealized_pips=round(pips, 2),
            risk_level=RiskLevel.normal if pips > -10 else RiskLevel.high,
            max_daily_drawdown_used=random_float(0.02, 0.08, 3),
            max_daily_drawdown_limit=0.1,
        )
        session.add(position)

    await session.commit()


async def seed_optimizer_runs(session):
    run = OptimizerRun(
        id=f"run_{uuid4().hex[:8]}",
        status="completed",
        progress=1.0,
        current_iteration=500000,
        total_iterations=500000,
        best_score=random_float(1.5, 2.5, 4),
        eta_seconds=0,
        parameters={
            "strategy_count": 5,
            "parameter_space": "500K combinations",
            "walk_forward": "80/20 split",
        },
        completed_at=datetime.utcnow(),
    )
    session.add(run)
    await session.commit()


async def seed_news_events(session):
    events = [
        {"title": "US Non-Farm Payrolls", "impact": NewsImpact.high, "currency": "USD"},
        {"title": "ECB Interest Rate Decision", "impact": NewsImpact.high, "currency": "EUR"},
        {"title": "UK CPI Data Release", "impact": NewsImpact.medium, "currency": "GBP"},
        {"title": "FOMC Meeting Minutes", "impact": NewsImpact.high, "currency": "USD"},
        {"title": "Australia Employment Data", "impact": NewsImpact.medium, "currency": "AUD"},
    ]

    for i, event in enumerate(events):
        news = NewsEvent(
            id=f"news_{i+1:03d}",
            title=event["title"],
            impact=event["impact"],
            scheduled_time=datetime.utcnow() + timedelta(hours=random_int(1, 72)),
            currency=event["currency"],
        )
        session.add(news)

    await session.commit()


async def main():
    print("🌱 Seeding database...")
    
    # Create tables
    async with engine.begin() as conn:
        from app.db.models import Base
        await conn.run_sync(Base.metadata.create_all)
    
    from app.db.database import async_session
    
    async with async_session() as session:
        # Check if already seeded
        result = await session.execute(func.count(Strategy.id))
        if result.scalar() > 0:
            print("⚠️  Database already contains data. Skipping seed.")
            return
        
        strategies = await seed_strategies(session)
        print(f"✅ Seeded {len(strategies)} strategies")
        
        await seed_trades(session, strategies)
        print("✅ Seeded 20 trades")
        
        await seed_positions(session, strategies)
        print("✅ Seeded 4 positions")
        
        await seed_optimizer_runs(session)
        print("✅ Seeded optimizer run")
        
        await seed_news_events(session)
        print("✅ Seeded news events")
        
        print("🎉 Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(main())
