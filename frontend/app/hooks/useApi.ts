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

// ── Polled live positions hook ───────────────────────────────────────

import { useCallback, useRef } from "react";

export function useLivePositionsPoll(intervalMs: number = 5000) {
  const [positions, setPositions] = useState<PositionUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const data = await getCurrentPositions();
      if (data) {
        setPositions(data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch live positions:", err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
    intervalRef.current = setInterval(fetchPositions, intervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPositions, intervalMs]);

  return { positions, isLoading, refresh: fetchPositions };
}
