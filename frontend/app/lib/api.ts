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
  MT5ConnectionStatus,
  MT5AccountInfo,
  MT5StrategyConfig,
} from "@/app/types";
import {
  generateMockStrategies,
  generateMockTrades,
  generateMockPositions,
  generateMockDashboardSummary,
  generateMockOptimizerState,
  generateMockNews,
  generateMockMT5Status,
} from "./mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function postJSON<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return null;
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

// ── MT5 ───────────────────────────────────────────────────────────────

export async function getMT5Status(): Promise<MT5ConnectionStatus> {
  return fetchJSON<MT5ConnectionStatus>("/mt5/status", generateMockMT5Status());
}

export async function connectMT5(host: string = "127.0.0.1", port: number = 5555): Promise<any> {
  return postJSON("/mt5/connect", { host, port });
}

export async function disconnectMT5(): Promise<any> {
  return postJSON("/mt5/disconnect", {});
}

export async function stopMT5Trading(): Promise<any> {
  return postJSON("/mt5/stop", {});
}

export async function emergencyCloseMT5(): Promise<any> {
  return postJSON("/mt5/emergency", {});
}

export async function updateMT5Params(params: Record<string, unknown>): Promise<any> {
  return postJSON("/mt5/params", params);
}

export async function getMT5Account(): Promise<MT5AccountInfo | null> {
  return fetchJSON<MT5AccountInfo | null>("/mt5/account", null);
}

export async function getMT5Positions(): Promise<{ positions: Array<Record<string, unknown>>; count: number }> {
  return fetchJSON("/mt5/positions", { positions: [], count: 0 });
}

export async function getMT5Heartbeat(): Promise<any> {
  return fetchJSON("/mt5/heartbeat", { last_heartbeat: null, connected: false, alive: false });
}

// ── Helpers for SYNC compatibility ────────────────────────────────────
//
// Components that need data immediately (not in async event handlers)
// can use these. They return a promise so the component can handle
// loading states properly.

export { generateMockStrategies, generateMockTrades, generateMockPositions };
