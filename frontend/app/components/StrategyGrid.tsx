"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { StrategyOptimizationResult } from "@/app/types";

interface StrategyGridProps {
  strategies: StrategyOptimizationResult[];
}

export default function StrategyGrid({ strategies }: StrategyGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Strategy Performance
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            Optimized strategies ranked by composite score
          </p>
        </div>
        <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Strategy
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Profit Factor
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Sharpe
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Max DD
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Composite
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {strategies.map((strategy, index) => (
              <motion.tr
                key={strategy.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="hover:bg-neutral-800/30 transition-colors cursor-pointer group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        strategy.composite_score > 1.5
                          ? "bg-emerald-500"
                          : strategy.composite_score > 1.2
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {strategy.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {strategy.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center rounded-md bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-300">
                    {strategy.symbol}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-sm font-medium ${
                        strategy.backtest_metrics.win_rate > 0.55
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {(strategy.backtest_metrics.win_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm text-neutral-300">
                    {strategy.backtest_metrics.profit_factor.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm text-neutral-300">
                    {strategy.backtest_metrics.sharpe_ratio.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm text-red-400">
                    {(strategy.backtest_metrics.max_drawdown * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm font-bold text-white">
                    {strategy.composite_score.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      strategy.status === "deployed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : strategy.status === "ready_for_deployment"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {strategy.status === "deployed" && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {strategy.status === "ready_for_deployment" && (
                      <Clock className="h-3 w-3" />
                    )}
                    {strategy.status === "failed" && (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {strategy.status === "deployed"
                      ? "Deployed"
                      : strategy.status === "ready_for_deployment"
                      ? "Ready"
                      : "Failed"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
