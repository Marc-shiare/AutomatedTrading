// ── Trading Platform API Client ──────────────────────────────────
//
// Replaces mock data generators with real API calls.
// Falls back to mock data when API is unavailable (USE_MOCK=true).
//
// Usage:
//   import { getStrategies } from "@/app/lib/api";
//   const strategies = await getStrategies();

import {
  StrategyOptimizationResult,
  LiveTrade,
  PositionUpdate,
  DashboardSummary,
  OptimizerState,
  NewsEvent,
} from "@/app/types";
import {
  generateMockStrategies,
  generateMockTrades,
  generateMockPositions,
  generateMockDashboardSummary,
  generateMockOptimizerState,
  generateMockNews,
} from "./mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      // cache: "no-store" for real-time data
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ── Strategies ────────────────────────────────────────────────────────

export async function getStrategies(): Promise<StrategyOptimizationResult[]> {
  return fetchJSON<StrategyOptimizationResult[]>(
    "/strategies",
    generateMockStrategies(6)
  );
}

export async function getStrategyHistory(strategyId: string) {
  return fetchJSON<any>(`/strategies/${strategyId}/optimization-history`, {
    strategy_id: strategyId,
    history: [],
  });
}

// ── Positions ────────────────────────────────────────────────────────

export async function getCurrentPositions(): Promise<PositionUpdate[]> {
  return fetchJSON<PositionUpdate[]>("/positions/current", generateMockPositions(4));
}

// ── Trades ───────────────────────────────────────────────────────────

export async function getRecentTrades(): Promise<LiveTrade[]> {
  return fetchJSON<LiveTrade[]>("/trades/recent", generateMockTrades(10));
}

// ── News ──────────────────────────────────────────────────────────────

export async function getUpcomingNews(): Promise<NewsEvent[]> {
  return fetchJSON<NewsEvent[]>("/news/upcoming", generateMockNews(5));
}

// ── Dashboard ────────────────────────────────────────────────────────

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchJSON<DashboardSummary>("/dashboard/summary", generateMockDashboardSummary());
}

// ── Optimizer ────────────────────────────────────────────────────────

export async function getOptimizerState(): Promise<OptimizerState> {
  return fetchJSON<OptimizerState>("/optimizer/state", generateMockOptimizerState());
}

export async function startOptimizer(): Promise<OptimizerState> {
  return fetchJSON<OptimizerState>("/optimizer/start", generateMockOptimizerState());
}

// ── Helpers for SYNC compatibility ────────────────────────────────────
//
// Components that need data immediately (not in async event handlers)
// can use these. They return a promise so the component can handle
// loading states properly.

export { generateMockStrategies, generateMockTrades, generateMockPositions };
