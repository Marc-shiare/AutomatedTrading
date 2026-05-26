"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface MarketData {
  pair: string;
  bid: number;
  ask: number;
  spread: number;
  changePct: number;
  volume: string;
}

const PAIRS: MarketData[] = [
  { pair: "EURUSD", bid: 1.0856, ask: 1.0858, spread: 2.0, changePct: 0.12, volume: "45.2B" },
  { pair: "GBPUSD", bid: 1.2745, ask: 1.2748, spread: 3.0, changePct: -0.05, volume: "28.1B" },
  { pair: "USDJPY", bid: 150.32, ask: 150.35, spread: 3.0, changePct: 0.33, volume: "62.5B" },
  { pair: "XAUUSD", bid: 2035.40, ask: 2035.90, spread: 5.0, changePct: 0.87, volume: "15.8B" },
];

export default function DailyMarketSummary() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.85 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Market Summary</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Top movers today</p>
        </div>
        <Globe className="h-4 w-4 text-neutral-500" />
      </div>

      <div className="space-y-2">
        {PAIRS.map((pair) => {
          const isPositive = pair.changePct >= 0;
          return (
            <div
              key={pair.pair}
              className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-white w-14">
                  {pair.pair}
                </span>
                <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {pair.changePct.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-300">{pair.bid.toFixed(pair.pair === "XAUUSD" ? 2 : pair.pair === "USDJPY" ? 2 : 4)}</p>
                <p className="text-[10px] text-neutral-600">Vol: {pair.volume}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors text-center border-t border-neutral-800"
      >
        {expanded ? "Show less" : "View all pairs"}
      </button>
    </motion.div>
  );
}
