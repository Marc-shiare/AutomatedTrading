"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import StrategyGrid from "@/app/components/StrategyGrid";
import { useApi } from "@/app/hooks/useApi";
import { TrendingUp, BarChart3, CheckCircle2, Clock, Zap } from "lucide-react";

export default function StrategiesPage() {
  const { strategies } = useApi();
  const [filter, setFilter] = useState<"all" | "deployed" | "ready" | "failed">("all");

  const strategyList = strategies.data || [];

  const filtered =
    filter === "all"
      ? strategyList
      : strategyList.filter((s) =>
          filter === "deployed"
            ? s.status === "deployed"
            : filter === "ready"
            ? s.status === "ready_for_deployment"
            : s.status === "failed"
        );

  const deployedCount = strategyList.filter((s) => s.status === "deployed").length;
  const readyCount = strategyList.filter((s) => s.status === "ready_for_deployment").length;
  const avgScore = strategyList.length > 0
    ? strategyList.reduce((acc, s) => acc + s.composite_score, 0) / strategyList.length
    : 0;

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
          <StatCard icon={CheckCircle2} label="Deployed" value={deployedCount} bg="bg-emerald-500/10" iconColor="text-emerald-400" />
          <StatCard icon={Clock} label="Ready" value={readyCount} bg="bg-yellow-500/10" iconColor="text-yellow-400" />
          <StatCard icon={TrendingUp} label="Avg Score" value={avgScore.toFixed(2)} bg="bg-cyan-500/10" iconColor="text-cyan-400" />
          <StatCard icon={Zap} label="Total" value={strategyList.length} bg="bg-neutral-500/10" iconColor="text-neutral-400" />
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

function StatCard({ icon: Icon, label, value, bg, iconColor }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
