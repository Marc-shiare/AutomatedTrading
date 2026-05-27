import { useState, useEffect } from "react";
import {
  StrategyOptimizationResult,
  LiveTrade,
  PositionUpdate,
  DashboardSummary,
  OptimizerState,
  NewsEvent,
} from "@/app/types";
import {
  getStrategies,
  getCurrentPositions,
  getRecentTrades,
  getUpcomingNews,
  getDashboardSummary,
  getOptimizerState,
} from "@/app/lib/api";

// ── Types ───────────────────────────────────────────────────────────────

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn {
  strategies: ApiState<StrategyOptimizationResult[]>;
  positions: ApiState<PositionUpdate[]>;
  trades: ApiState<LiveTrade[]>;
  news: ApiState<NewsEvent[]>;
  summary: ApiState<DashboardSummary>;
  optimizer: ApiState<OptimizerState>;
  loading: boolean;
  refresh: () => void;
  refreshKey: number;
}

// ── Generic fetch helper ──────────────────────────────────────────────

async function fetchWithFallback<T>(
  fetcher: () => Promise<T>,
  setState: React.Dispatch<React.SetStateAction<ApiState<T>>>
): Promise<void> {
  setState((prev) => ({ ...prev, loading: true, error: null }));
  try {
    const data = await fetcher();
    setState({ data, loading: false, error: null });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    setState((prev) => ({
      ...prev,
      loading: false,
      error,
    }));
  }
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useApi(): UseApiReturn {
  const [strategies, setStrategies] = useState<ApiState<StrategyOptimizationResult[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const [positions, setPositions] = useState<ApiState<PositionUpdate[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const [trades, setTrades] = useState<ApiState<LiveTrade[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const [news, setNews] = useState<ApiState<NewsEvent[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const [summary, setSummary] = useState<ApiState<DashboardSummary>>({
    data: null,
    loading: true,
    error: null,
  });

  const [optimizer, setOptimizer] = useState<ApiState<OptimizerState>>({
    data: null,
    loading: true,
    error: null,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  // Load data on mount
  useEffect(() => {
    fetchWithFallback(getStrategies, setStrategies);
    fetchWithFallback(getCurrentPositions, setPositions);
    fetchWithFallback(getRecentTrades, setTrades);
    fetchWithFallback(getUpcomingNews, setNews);
    fetchWithFallback(getDashboardSummary, setSummary);
    fetchWithFallback(getOptimizerState, setOptimizer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  // Check if any endpoint is still loading
  const loading = strategies.loading || positions.loading || trades.loading || news.loading || summary.loading || optimizer.loading;

  return {
    strategies,
    positions,
    trades,
    news,
    summary,
    optimizer,
    loading,
    refresh,
    refreshKey,
  };
}