"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Server, Activity, DollarSign } from "lucide-react";
import type { MT5ConnectionStatus } from "@/app/types";
import { getMT5Status } from "@/app/lib/api";
import { generateMockMT5Status } from "@/app/lib/mockData";

export default function MT5Status() {
  const [status, setStatus] = useState<MT5ConnectionStatus | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await getMT5Status();
      setStatus(s);
    } catch {
      // fallback to mock
      setStatus(generateMockMT5Status());
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const isConnected = status?.connected ?? false;
  const isAlive = status?.alive ?? false;
  const info = status?.account_info;

  const indicatorColor = isConnected && isAlive
    ? "bg-emerald-500"
    : isConnected && !isAlive
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-neutral-400" />
          <h3 className="text-sm font-semibold text-white">MT5 Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${indicatorColor}`} />
          <span className="text-xs text-neutral-500">
            {isConnected ? (isAlive ? "Connected" : "Stale") : "Offline"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Account summary */}
        {info && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-neutral-500">Balance</p>
              <p className="text-sm font-medium text-white">
                ${info.balance.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500">Equity</p>
              <p className="text-sm font-medium text-white">
                ${info.equity.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500">P&amp;L</p>
              <p className={`text-sm font-medium ${info.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ${info.profit.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Position count */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
          <Activity className="h-4 w-4 text-neutral-500" />
          <span className="text-xs text-neutral-500">Open positions:</span>
          <span className="text-xs font-medium text-white">--</span>
        </div>
      </div>
    </motion.div>
  );
}