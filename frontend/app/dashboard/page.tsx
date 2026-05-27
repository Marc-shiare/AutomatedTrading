"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/app/components/DashboardLayout";
import ToastAlertPopups from "@/app/components/ToastAlertPopups";
import KPICards from "@/app/components/KPICards";
import StrategyGrid from "@/app/components/StrategyGrid";
import LivePositions from "@/app/components/LivePositions";
import TradeExecutionLog from "@/app/components/TradeExecutionLog";
import OptimizerProgress from "@/app/components/OptimizerProgress";
import OptimizerStats from "@/app/components/OptimizerStats";
import TradeWeekSummary from "@/app/components/TradeWeekSummary";
import DailyMarketSummary from "@/app/components/DailyMarketSummary";
import PerformanceSnapshot from "@/app/components/PerformanceSnapshot";
import { useApi } from "@/app/hooks/useApi";
import { SkeletonKPI, SkeletonCard, SkeletonChart } from "@/app/components/SkeletonLoaders";

const EquityCurveChart = dynamic(
  () => import("@/app/components/EquityCurveChart"),
  { ssr: false }
);

export default function DashboardPage() {
  const {
    strategies,
    positions,
    trades,
    news,
    summary,
    optimizer,
    loading,
  } = useApi();

  return (
    <DashboardLayout>
      {/* Floating alerts overlay */}
      <ToastAlertPopups />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Overview of your trading performance and active strategies
          </p>
        </div>

        <KPICards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <EquityCurveChart />
          </div>
          <div>
            <LivePositions positions={loading ? [] : (positions.data ?? [])} />
          </div>
        </div>

        {/* Row 3: Trade log + Optimizer (mirrors row 2) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <TradeExecutionLog trades={loading ? undefined : (trades.data ?? undefined)} />
          </div>
          <div>
            <OptimizerProgress />
          </div>
        </div>

        {/* Row 4: 3-column data cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <TradeWeekSummary />
          <DailyMarketSummary />
          <PerformanceSnapshot />
        </div>

        <StrategyGrid strategies={strategies.data || []} />
      </div>
    </DashboardLayout>
  );
}
