"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface DaySummary {
  day: string;
  pnl: number;
  trades: number;
  winRate: number;
}

function generateWeekSummary(): DaySummary[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    pnl: Math.round((Math.random() - 0.45) * 1200) / 100,
    trades: Math.floor(Math.random() * 15) + 3,
    winRate: Math.floor(Math.random() * 30) + 55,
  }));
}

function formatCurrency(value: number): string {
  if (value === 0) return "$0.00";
  const abs = Math.abs(value);
  return `${value >= 0 ? "+" : "-"}$${abs.toFixed(2)}`;
}

export default function TradeWeekSummary() {
  const [week] = useState<DaySummary[]>(() => generateWeekSummary());

  const totalPnl = week.reduce((sum, d) => sum + d.pnl, 0);
  const totalTrades = week.reduce((sum, d) => sum + d.trades, 0);
  const avgWinRate = Math.round(week.reduce((sum, d) => sum + d.winRate, 0) / week.length);

  // Find max value for bar scaling
  const maxPnl = Math.max(...week.map((d) => Math.abs(d.pnl)), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Weekly Recap</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Last 7 days</p>
        </div>
        <BarChart3 className="h-4 w-4 text-neutral-500" />
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-2 h-16 mb-4">
        {week.map((day) => {
          const barHeight = (Math.abs(day.pnl) / maxPnl) * 100;
          const isPositive = day.pnl >= 0;
          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: "48px" }}>
                <div
                  className={`w-3 rounded-t ${isPositive ? "bg-emerald-500/40" : "bg-red-500/40"}`}
                  style={{ height: `${Math.max(barHeight * 0.48, 4)}px` }}
                />
              </div>
              <span className="text-[10px] text-neutral-600 font-medium">{day.day}</span>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-800">
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-1">P&L</p>
          <p className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatCurrency(totalPnl)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-1">Trades</p>
          <p className="text-sm font-bold text-white">{totalTrades}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-1">Win Rate</p>
          <p className="text-sm font-bold text-emerald-400">{avgWinRate}%</p>
        </div>
      </div>
    </motion.div>
  );
}
