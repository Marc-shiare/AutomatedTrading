"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import StrategyGrid from "@/app/components/StrategyGrid";
import { generateMockStrategies } from "@/app/lib/mockData";
import { TrendingUp, BarChart3, CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";

export default function StrategiesPage() {
  const strategies = generateMockStrategies(8);
  const [filter, setFilter] = useState<"all" | "deployed" | "ready" | "failed">("all");

  const filtered =
    filter === "all"
      ? strategies
      : strategies.filter((s) =>
          filter === "deployed"
            ? s.status === "deployed"
            : filter === "ready"
            ? s.status === "ready_for_deployment"
            : s.status === "failed"
        );

  const deployedCount = strategies.filter((s) => s.status === "deployed").length;
  const readyCount = strategies.filter((s) => s.status === "ready_for_deployment").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategies</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage and monitor your trading strategies
          </p>
        </div>

        {/* Strategy Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Deployed</p>
                <p className="text-2xl font-bold text-white">{deployedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Ready</p>
                <p className="text-2xl font-bold text-white">{readyCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Avg Score</p>
                <p className="text-2xl font-bold text-white">
                  {(strategies.reduce((s, st) => s + st.composite_score, 0) / strategies.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-neutral-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Total</p>
                <p className="text-2xl font-bold text-white">{strategies.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
            {(["all", "deployed", "ready", "failed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-emerald-500 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {f === "ready" ? "Ready" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StrategyGrid strategies={filtered} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
