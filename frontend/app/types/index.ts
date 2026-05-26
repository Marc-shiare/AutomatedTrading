// ── Types ──────────────────────────────────────────────────────────

export interface StrategyParameters {
  fast_ma: number;
  slow_ma: number;
  rsi_threshold: number;
  stop_loss_pips: number;
  take_profit_pips: number;
  risk_per_trade: number;
}

export interface BacktestMetrics {
  total_trades: number;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  sharpe_ratio: number;
  return_percent: number;
}

export interface StrategyOptimizationResult {
  id: string;
  name: string;
  symbol: string;
  pair: string;
  base_currency: string;
  quote_currency: string;
  optimization_date: string;
  parameters: StrategyParameters;
  backtest_metrics: BacktestMetrics;
  composite_score: number;
  status: "ready_for_deployment" | "deployed" | "failed";
  previous_scores: number[];
}

export interface LiveTrade {
  id: string;
  strategy_id: string;
  symbol: string;
  pair: string;
  side: "BUY" | "SELL";
  entry_time: string;
  entry_price: number;
  exit_time?: string;
  exit_price?: number;
  lot_size: number;
  position_size: number;
  pnl: number;
  pnl_pips: number;
  pnl_percent: number;
  risk_reward_ratio: number;
  spread_pips: number;
  commission: number;
  status: "open" | "closed";
}

export interface PositionUpdate {
  symbol: string;
  pair: string;
  strategy_id: string;
  side: "BUY" | "SELL";
  current_lot_size: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  unrealized_pips: number;
  risk_level: "low" | "normal" | "high" | "critical";
  max_daily_drawdown_used: number;
  max_daily_drawdown_limit: number;
  timestamp: string;
}

export interface DashboardSummary {
  total_pnl: number;
  total_pips: number;
  win_rate: number;
  sharpe_ratio: number;
  max_drawdown: number;
  active_strategies: number;
  total_trades_today: number;
  total_lots_traded: number;
}

export interface OptimizerState {
  status: "idle" | "running" | "completed" | "failed";
  progress: number;
  current_iteration: number;
  total_iterations: number;
  best_score: number;
  eta_seconds: number;
}

export interface NewsEvent {
  id: string;
  title: string;
  impact: "low" | "medium" | "high";
  scheduled_time: string;
  currency: string;
}

// ── MT5 Integration Types ──────────────────────────────────────────

export interface MT5ConnectionStatus {
  connected: boolean;
  alive: boolean;
  last_heartbeat: string | null;
  account_info: MT5AccountInfo | null;
}

export interface MT5AccountInfo {
  login: number;
  server: string;
  currency: string;
  leverage: number;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  profit: number;
}

export interface MT5StrategyConfig {
  name: string;
  symbol: string;
  timeframe: string;
  parameters: StrategyParameters;
  magic_number: number;
  enabled: boolean;
}
