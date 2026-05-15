from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from app.models.schemas import (
    StrategyOptimizationResult,
    PositionUpdate,
    DashboardSummary,
    OptimizerState,
    NewsEvent,
)
from app.utils.mock_data import (
    generate_mock_strategies,
    generate_mock_positions,
    generate_mock_dashboard_summary,
    generate_mock_optimizer_state,
    generate_mock_news,
)

router = APIRouter()


@router.get("/strategies", response_model=List[StrategyOptimizationResult])
async def get_strategies():
    """Get all optimized strategies."""
    return generate_mock_strategies(6)


@router.get("/strategies/{strategy_id}/optimization-history")
async def get_strategy_optimization_history(strategy_id: str):
    """Get optimization history for a specific strategy."""
    strategies = generate_mock_strategies(6)
    for strategy in strategies:
        if strategy["id"] == strategy_id:
            return {
                "strategy_id": strategy_id,
                "history": [
                    {
                        "date": datetime.now().isoformat(),
                        "composite_score": score,
                        "parameters": strategy["parameters"],
                    }
                    for score in strategy["previous_scores"]
                ],
            }
    raise HTTPException(status_code=404, detail="Strategy not found")


@router.get("/positions/current", response_model=List[PositionUpdate])
async def get_current_positions():
    """Get current open positions."""
    return generate_mock_positions(4)


@router.get("/news/upcoming", response_model=List[NewsEvent])
async def get_upcoming_news():
    """Get upcoming economic news events."""
    return generate_mock_news(5)


@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """Get dashboard summary metrics."""
    return generate_mock_dashboard_summary()


@router.post("/optimizer/start", response_model=OptimizerState)
async def start_optimizer():
    """Start the strategy optimizer."""
    return {
        "status": "running",
        "progress": 0.0,
        "current_iteration": 0,
        "total_iterations": 500000,
        "best_score": 0.0,
        "eta_seconds": 86400,
    }


@router.post("/strategy/{strategy_id}/enable")
async def enable_strategy(strategy_id: str):
    """Enable a strategy for deployment."""
    return {
        "strategy_id": strategy_id,
        "status": "enabled",
        "message": f"Strategy {strategy_id} is now ready for deployment",
    }


@router.post("/strategy/{strategy_id}/disable")
async def disable_strategy(strategy_id: str):
    """Disable a strategy."""
    return {
        "strategy_id": strategy_id,
        "status": "disabled",
        "message": f"Strategy {strategy_id} has been disabled",
    }
