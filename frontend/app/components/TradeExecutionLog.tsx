"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Clock, CircleDollarSign, TrendingUp } from "lucide-react";
import { LiveTrade } from "@/app/types";
import { generateMockTrades } from "@/app/lib/mockData";

interface TradeExecutionLogProps {
  trades?: LiveTrade[];
  maxItems?: number;
  autoRefresh?: boolean;
}

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TradeExecutionLog({
  trades: initialTrades,
  maxItems = 8,
  autoRefresh = true,
}: TradeExecutionLogProps) {
  const [tradeList, setTradeList] = useState<LiveTrade[]>(initialTrades || generateMockTrades(6));
  const [newTradeId, setNewTradeId] = useState<string | null>(null);

  const addTrade = useCallback(() => {
    const newTrade = generateMockTrades(1)[0];
    newTrade.id = `trade_${Date.now()}`;
    newTrade.entry_time = new Date().toISOString();
    newTrade.status = Math.random() > 0.3 ? "closed" : "open";

    if (newTrade.status === "closed" && !newTrade.exit_time) {
      newTrade.exit_time = new Date(Date.now() + 1000 * 60 * 30).toISOString();
      newTrade.exit_price = newTrade.entry_price + (Math.random() - 0.45) * 0.01;
    }

    setTradeList((prev) => {
      const updated = [newTrade, ...prev].slice(0, maxItems);
      return updated;
    });
    setNewTradeId(newTrade.id);
    setTimeout(() => setNewTradeId(null), 2000);
  }, [maxItems]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        addTrade();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [autoRefresh, addTrade]);

  const openCount = tradeList.filter((t) => t.status === "open").length;
  const closedCount = tradeList.filter((t) => t.status === "closed").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Trade Execution Log</h3>
          <p className="text-sm text-neutral-400 mt-1">Recent trade activity</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            {openCount} Open
          </span>
          <span className="flex items-center gap-1 text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-neutral-500" />
            {closedCount} Closed
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {tradeList.map((trade) => (
            <motion.div
              key={trade.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                newTradeId === trade.id
                  ? "bg-emerald-500/5 border border-emerald-500/20"
                  : "bg-neutral-800/30 hover:bg-neutral-800/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-lg ${
                    trade.side === "BUY"
                      ? "bg-emerald-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  {trade.side === "BUY" ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{trade.pair}</span>
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                        trade.side === "BUY"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {trade.side}
                    </span>
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                        trade.status === "open"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-neutral-700 text-neutral-400"
                      }`}
                    >
                      {trade.status === "open" ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-500">
                      {trade.lot_size.toFixed(2)} lots @ {trade.entry_price.toFixed(5)}
                    </span>
                    <span className="text-xs text-neutral-600">|</span>
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(trade.entry_time)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {trade.pnl_pips >= 0 ? "+" : ""}
                  {trade.pnl_pips.toFixed(1)} pips
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {tradeList.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <CircleDollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No trades executed yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
