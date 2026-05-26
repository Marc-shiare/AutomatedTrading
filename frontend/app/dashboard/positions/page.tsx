"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import LivePositions from "@/app/components/LivePositions";
import TradeExecutionLog from "@/app/components/TradeExecutionLog";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

export default function PositionsPage() {
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Positions</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Monitor your open and closed positions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Open Positions</p>
                <p className="text-2xl font-bold text-white">4</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Long Positions</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Short Positions</p>
                <p className="text-2xl font-bold text-white">1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "live"
                ? "bg-emerald-500 text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Live Positions
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-emerald-500 text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Trade History
          </button>
        </div>

        {activeTab === "live" ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <LivePositions />
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Position Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Total Exposure</span>
                    <span className="text-sm font-medium text-white">2.85 lots</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Net Exposure</span>
                    <span className="text-sm font-medium text-emerald-400">+1.65 lots</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Used Margin</span>
                    <span className="text-sm font-medium text-white">$1,250.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Free Margin</span>
                    <span className="text-sm font-medium text-white">$11,500.50</span>
                  </div>
                  <div className="border-t border-neutral-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-400">Unrealized P&L</span>
                      <span className="text-sm font-bold text-emerald-400">+$245.50</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <TradeExecutionLog />
        )}
      </div>
    </DashboardLayout>
  );
}
