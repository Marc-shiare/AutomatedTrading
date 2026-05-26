"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import DashboardLayout from "@/app/components/DashboardLayout";
import EquityCurveChart from "@/app/components/EquityCurveChart";
import KPICards from "@/app/components/KPICards";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  Target,
} from "lucide-react";

export default function PerformancePage() {
  const [period, setPeriod] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M");

  // Mock performance data
  const stats = {
    totalReturn: 34.5,
    avgTrade: 125.4,
    maxConsecutiveWins: 7,
    maxConsecutiveLosses: 3,
    profitFactor: 2.15,
    recoveryFactor: 3.2,
    tradesPerDay: 12.5,
    avgHoldingTime: "4h 32m",
  };

  const monthlyStats = [
    { month: "Jan", pnl: 2500, trades: 145, winRate: 62 },
    { month: "Feb", pnl: 1800, trades: 132, winRate: 58 },
    { month: "Mar", pnl: 3200, trades: 160, winRate: 65 },
    { month: "Apr", pnl: 1500, trades: 120, winRate: 55 },
    { month: "May", pnl: 2800, trades: 148, winRate: 64 },
    { month: "Jun", pnl: 2100, trades: 135, winRate: 60 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Detailed trading performance and analytics
          </p>
        </div>

        <KPICards />

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
            {(["1D", "1W", "1M", "3M", "1Y"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-emerald-500 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <EquityCurveChart />
          </div>
          <div className="space-y-6">
            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Return", value: `+${stats.totalReturn}%`, icon: TrendingUp, positive: true },
                  { label: "Avg Trade", value: `+$${stats.avgTrade}`, icon: BarChart3, positive: true },
                  { label: "Profit Factor", value: stats.profitFactor.toFixed(2), icon: Target, positive: true },
                  { label: "Max Cons. Wins", value: stats.maxConsecutiveWins, icon: Activity, positive: true },
                  { label: "Max Cons. Losses", value: stats.maxConsecutiveLosses, icon: TrendingDown, positive: false },
                  { label: "Trades/Day", value: stats.tradesPerDay, icon: PieChart, positive: true },
                  { label: "Avg Hold Time", value: stats.avgHoldingTime, icon: Activity, positive: true },
                  { label: "Recovery Factor", value: stats.recoveryFactor, icon: TrendingUp, positive: true },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <stat.icon
                        className={`h-4 w-4 ${
                          stat.positive ? "text-emerald-400" : "text-red-400"
                        }`}
                      />
                      <span className="text-sm text-neutral-400">{stat.label}</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        stat.positive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Month</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">P&L</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Trades</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Win Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {monthlyStats.map((stat) => (
                  <tr
                    key={stat.month}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-white">{stat.month}</td>
                    <td className="py-3 px-4 text-right text-sm text-emerald-400">
                      +${stat.pnl.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-neutral-300">
                      {stat.trades}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-neutral-300">
                      {stat.winRate}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Profitable
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
