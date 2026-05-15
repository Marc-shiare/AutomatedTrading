"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/app/components/DashboardLayout";
import KPICards from "@/app/components/KPICards";
import StrategyGrid from "@/app/components/StrategyGrid";
import LivePositions from "@/app/components/LivePositions";
import { generateMockStrategies, generateMockPositions } from "@/app/lib/mockData";

const EquityCurveChart = dynamic(
  () => import("@/app/components/EquityCurveChart"),
  { ssr: false }
);

export default function DashboardPage() {
  const strategies = generateMockStrategies(6);
  const positions = generateMockPositions(4);

  return (
    <DashboardLayout>
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
            <LivePositions positions={positions} />
          </div>
        </div>

        <StrategyGrid strategies={strategies} />
      </div>
    </DashboardLayout>
  );
}
