"use client";

import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { PositionUpdate } from "@/app/types";
import { useLivePositions } from "@/app/hooks/useLivePositions";

interface LivePositionsWidgetProps {
  positions?: PositionUpdate[];
}

export default function LivePositionsWidget({ positions: propPositions }: LivePositionsWidgetProps) {
  const hook = useLivePositions(4, 5000);
  const positions = propPositions ?? hook.positions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Live Positions</h3>
          <p className="text-sm text-neutral-400 mt-1">Real-time position updates</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-neutral-500">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {positions.map((position, index) => (
          <motion.div
            key={`${position.symbol}-${position.strategy_id}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                  position.side === "BUY" ? "bg-emerald-500/10" : "bg-red-500/10"
                }`}
              >
                {position.side === "BUY" ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{position.symbol}</span>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                      position.side === "BUY"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {position.side}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Size: {position.current_lot_size} lots @ {position.entry_price.toFixed(5)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-medium ${
                  position.unrealized_pnl >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {position.unrealized_pnl >= 0 ? "+" : ""}$ {position.unrealized_pnl.toFixed(2)}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {position.unrealized_pips >= 0 ? "+" : ""}
                {position.unrealized_pips.toFixed(1)} pips
              </p>
            </div>
          </motion.div>
        ))}

        {positions.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No open positions</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
