"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, Clock, Zap, ArrowUpRight, BarChart3 } from "lucide-react";

export default function PerformanceSnapshot() {
  const metrics = [
    { label: "Today P&L", value: "+$245.50", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Open Trades", value: "4 / 6 max", icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Avg Win", value: "$125.40", icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Active Since", value: "14d 3h", icon: Clock, color: "text-neutral-400", bg: "bg-neutral-500/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Performance</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Current session</p>
        </div>
        <Zap className="h-4 w-4 text-neutral-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="p-3 rounded-lg bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors"
            >
              <div className={`h-8 w-8 rounded-lg ${metric.bg} flex items-center justify-center mb-2`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <p className={`text-sm font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-[10px] text-neutral-500 mt-1">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Weekly goal</span>
          <span className="text-xs text-emerald-400 font-medium">68% complete</span>
        </div>
        <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full w-[68%] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-neutral-500">Last updated</span>
        <span className="text-xs text-neutral-400 flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3" />
          Just now
        </span>
      </div>
    </motion.div>
  );
}
