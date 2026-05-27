"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import OptimizerProgress from "@/app/components/OptimizerProgress";
import { Zap, BarChart3, History, Settings, Play, ArrowRight } from "lucide-react";

const STRATEGY_TYPES = [
  { id: "momentum", name: "Momentum Breakout", description: "MA + RSI filter" },
  { id: "rsi", name: "RSI Reversal", description: "Oversold/Overbought" },
  { id: "macd", name: "MACD Cross", description: "Signal line crossover" },
];

export default function OptimizerPage() {
  const [selectedStrategy, setSelectedStrategy] = useState("momentum");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const handleStartOptimization = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch(`/api/optimize/${selectedStrategy}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: "EURUSD=X",
          timeframe: "1d",
          n_trials: 50,
        }),
      });
      const result = await response.json();
      setOptimizationResult(result);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Optimizer</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Run and monitor strategy optimization with Bayesian search
            </p>
          </div>
        </div>

        {/* Strategy Selector + Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Select Strategy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {STRATEGY_TYPES.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedStrategy === strategy.id
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-neutral-700 bg-neutral-800/30 hover:border-neutral-600"
                }`}
              >
                <p className="text-sm font-medium text-white">{strategy.name}</p>
                <p className="text-xs text-neutral-400 mt-1">{strategy.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleStartOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Optimization
              </>
            )}
          </button>

          {optimizationResult && (
            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400 font-medium">
                Status: {optimizationResult.status}
              </p>
              <p className="text-sm text-neutral-400">
                Task ID: {optimizationResult.task_id}
              </p>
            </div>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard icon={Zap} label="Active Jobs" value="0" bg="bg-emerald-500/10" iconColor="text-emerald-400" />
          <StatCard icon={BarChart3} label="Completed" value="12" bg="bg-cyan-500/10" iconColor="text-cyan-400" />
          <StatCard icon={History} label="Total Iterations" value="500K" bg="bg-yellow-500/10" iconColor="text-yellow-400" />
          <StatCard icon={Settings} label="Strategies" value="6" bg="bg-neutral-500/10" iconColor="text-neutral-400" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <OptimizerProgress autoSimulate />
          </div>
          <div className="space-y-6">
            {/* Optimization Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Optimization Settings</h3>
              <div className="space-y-3">
                <SettingRow label="Parameter Space" value="500,000" color="text-emerald-400" />
                <SettingRow label="Walk-Forward" value="80/20" color="text-cyan-400" />
                <SettingRow label="Scoring" value="PF × (1 - DD)" color="text-yellow-400" />
                <SettingRow label="Multiprocessing" value="8 cores" color="text-emerald-400" />
                <SettingRow label="Optimizer" value="Optuna TPE" color="text-purple-400" />
              </div>
            </motion.div>

            {/* Recent Runs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Runs</h3>
              <div className="space-y-3">
                {[
                  { name: "Momentum Breakout", date: "2 hours ago", score: 1.84, status: "completed" },
                  { name: "RSI Reversal", date: "5 hours ago", score: 1.72, status: "completed" },
                  { name: "MACD Cross", date: "1 day ago", score: 1.58, status: "completed" },
                ].map((run, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{run.name}</p>
                      <p className="text-xs text-neutral-500">{run.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-400">{run.score.toFixed(2)}</p>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 mt-0.5">
                        {run.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Results Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors group">
                  <span className="text-sm text-neutral-300 group-hover:text-white">View All Results</span>
                  <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors group">
                  <span className="text-sm text-neutral-300 group-hover:text-white">Export Results CSV</span>
                  <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
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

function SettingRow({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
      <span className="text-sm text-white">{label}</span>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  );
}
