import {
  StrategyOptimizationResult,
  LiveTrade,
  PositionUpdate,
  DashboardSummary,
  OptimizerState,
  NewsEvent,
} from "@/app/types";

const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD"];

const STRATEGY_NAMES = [
  "Momentum Breakout (10min)",
  "RSI Reversal (15min)",
  "MACD Cross (5min)",
  "Bollinger Squeeze (1H)",
  "Trend Follow (30min)",
  "Mean Reversion (5min)",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

export function generateMockStrategies(count = 6): StrategyOptimizationResult[] {
  return Array.from({ length: count }, (_, i) => {
    const winRate = randomFloat(0.45, 0.72, 2);
    const profitFactor = randomFloat(1.1, 2.8, 2);
    const maxDrawdown = randomFloat(0.08, 0.25, 2);
    const sharpe = randomFloat(0.8, 2.5, 2);
    const returnPct = randomFloat(5, 45, 1);
    const composite = parseFloat((profitFactor * (1 - maxDrawdown)).toFixed(2));

    return {
      id: `strategy_${String(i + 1).padStart(3, "0")}`,
      name: STRATEGY_NAMES[i % STRATEGY_NAMES.length],
      symbol: SYMBOLS[i % SYMBOLS.length],
      optimization_date: new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString(),
      parameters: {
        fast_ma: randomInt(5, 20),
        slow_ma: randomInt(25, 60),
        rsi_threshold: randomInt(55, 75),
        stop_loss_pips: randomInt(15, 50),
        risk_per_trade: randomFloat(1, 3, 1),
      },
      backtest_metrics: {
        total_trades: randomInt(80, 200),
        win_rate: winRate,
        profit_factor: profitFactor,
        max_drawdown: maxDrawdown,
        sharpe_ratio: sharpe,
        return_percent: returnPct,
      },
      composite_score: composite,
      status: i < 3 ? "deployed" : "ready_for_deployment",
      previous_scores: [
        composite - randomFloat(0.05, 0.15, 2),
        composite - randomFloat(0.1, 0.2, 2),
        composite + randomFloat(0.02, 0.08, 2),
      ],
    };
  });
}

export function generateMockTrades(count = 10): LiveTrade[] {
  return Array.from({ length: count }, (_, i) => {
    const side = Math.random() > 0.5 ? "BUY" : "SELL";
    const entryPrice = randomFloat(1.05, 1.25, 4);
    const pnl = randomFloat(-150, 300, 2);
    const pnlPercent = randomFloat(-1.5, 3.5, 3);

    return {
      id: `trade_${new Date().toISOString().split("T")[0].replace(/-/g, "")}_${String(i + 1).padStart(3, "0")}`,
      strategy_id: `strategy_${String((i % 6) + 1).padStart(3, "0")}`,
      symbol: SYMBOLS[i % SYMBOLS.length],
      side,
      entry_time: new Date(Date.now() - randomInt(1, 48) * 3600000).toISOString(),
      entry_price: entryPrice,
      exit_time: undefined,
      exit_price: undefined,
      position_size: randomFloat(0.1, 1.0, 2),
      pnl,
      pnl_percent: pnlPercent,
      risk_reward_ratio: randomFloat(1.0, 3.5, 1),
      slippage_pips: randomFloat(0.1, 1.5, 1),
      status: i < 3 ? "open" : "closed",
    };
  });
}

export function generateMockPositions(count = 4): PositionUpdate[] {
  return Array.from({ length: count }, (_, i) => {
    const side = Math.random() > 0.5 ? "BUY" : "SELL";
    const entryPrice = randomFloat(1.05, 1.25, 4);
    const currentPrice = entryPrice + (side === "BUY" ? randomFloat(-0.005, 0.015, 4) : randomFloat(-0.015, 0.005, 4));

    return {
      symbol: SYMBOLS[i % SYMBOLS.length],
      strategy_id: `strategy_${String((i % 6) + 1).padStart(3, "0")}`,
      side,
      current_size: randomFloat(0.2, 1.0, 2),
      entry_price: entryPrice,
      current_price: currentPrice,
      unrealized_pnl: parseFloat(((currentPrice - entryPrice) * 100000).toFixed(2)),
      risk_level: ["low", "normal", "high", "critical"][randomInt(0, 2)] as PositionUpdate["risk_level"],
      max_daily_drawdown_used: randomFloat(0.02, 0.08, 3),
      max_daily_drawdown_limit: 0.1,
      timestamp: new Date().toISOString(),
    };
  });
}

export function generateMockDashboardSummary(): DashboardSummary {
  return {
    total_pnl: randomFloat(1250, 8500, 2),
    win_rate: randomFloat(0.52, 0.68, 2),
    sharpe_ratio: randomFloat(1.2, 2.2, 2),
    max_drawdown: randomFloat(0.08, 0.18, 2),
    active_strategies: randomInt(3, 6),
    total_trades_today: randomInt(5, 25),
  };
}

export function generateMockOptimizerState(): OptimizerState {
  return {
    status: "idle",
    progress: 0,
    current_iteration: 0,
    total_iterations: 500000,
    best_score: 0,
    eta_seconds: 0,
  };
}

export function generateMockNews(count = 5): NewsEvent[] {
  const events = [
    { title: "US Non-Farm Payrolls", impact: "high" as const, currency: "USD" },
    { title: "ECB Interest Rate Decision", impact: "high" as const, currency: "EUR" },
    { title: "UK CPI Data Release", impact: "medium" as const, currency: "GBP" },
    { title: "FOMC Meeting Minutes", impact: "high" as const, currency: "USD" },
    { title: "Japan GDP Report", impact: "medium" as const, currency: "JPY" },
    { title: "Australia Employment Data", impact: "medium" as const, currency: "AUD" },
    { title: "Canada Retail Sales", impact: "low" as const, currency: "CAD" },
  ];

  return Array.from({ length: count }, (_, i) => {
    const event = events[i % events.length];
    return {
      id: `news_${String(i + 1).padStart(3, "0")}`,
      title: event.title,
      impact: event.impact,
      scheduled_time: new Date(Date.now() + randomInt(1, 72) * 3600000).toISOString(),
      currency: event.currency,
    };
  });
}
