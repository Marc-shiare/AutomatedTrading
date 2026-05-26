"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Trophy, Target, Zap, Activity, ArrowUpRight, Clock, Settings, TrendingUp, RotateCcw, Trash2 } from "lucide-react";

interface OptimizerStatsProps {
  onRestart?: () => void;
  onClearHistory?: () => void;
}

export default function OptimizerStats({ onRestart, onClearHistory }: OptimizerStatsProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = [
    { label: "Total Runs", value: "12", icon: BarChart3, color: "text-cyan-400", detail: "All time" },
    { label: "Best Score", value: "1.84", icon: Trophy, color: "text-yellow-400", detail: "Strategy #003" },
    { label: "Avg Time", value: "8.4h", icon: Clock, color: "text-emerald-400", detail: "Per 500K iterations" },
    { label: "Strategies", value: "6", icon: Zap, color: "text-neutral-400", detail: "Active in pool" },
  ];

  const recentRuns = [
    { name: "Momentum Breakout", score: 1.84, date: "2h ago", status: "completed" as const },
    { name: "RSI Reversal", score: 1.72, date: "5h ago", status: "completed" as const },
    { name: "MACD Cross", score: 1.58, date: "1d ago", status: "completed" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Optimizer Stats</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Historical runs</p>
        </div>
        <Activity className="h-4 w-4 text-neutral-500" />
      </div>

      {/* Main stats */}
      <div className="space-y-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors cursor-pointer group"
              onClick={() => {}}
              title={stat.detail}
            >
              <div className="flex items-center gap-2.5">
                <div className={`${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-neutral-400">{stat.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / collapse for run history */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors text-center border-t border-neutral-800"
      >
        {expanded ? "Hide recent runs" : "View recent runs"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {recentRuns.map((run) => (
                <div
                  key={run.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/20"
                >
                  <div>
                    <p className="text-xs text-white">{run.name}</p>
                    <p className="text-[10px] text-neutral-500">{run.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">{run.score.toFixed(2)}</p>
                    <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 mt-0.5">
                      {run.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer actions */}
      <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Last run</span>
          <span className="text-xs text-neutral-400">2 hours ago</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Next scheduled</span>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Tomorrow 5 AM
          </span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          {onRestart && (
            <button
              onClick={onRestart}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Restart
            </button>
          )}
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
