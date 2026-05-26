"use client";

import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import OptimizerProgress from "@/app/components/OptimizerProgress";
import { Zap, BarChart3, History, Settings } from "lucide-react";

export default function OptimizerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Optimizer</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Run and monitor strategy optimization
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Active Jobs</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Completed</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <History className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Total Iterations</p>
                <p className="text-2xl font-bold text-white">500K</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-neutral-500/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Strategies</p>
                <p className="text-2xl font-bold text-white">6</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <OptimizerProgress autoSimulate />
          </div>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Optimization Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Parameter Space</label>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                    <span className="text-sm text-white">Total Combinations</span>
                    <span className="text-sm font-medium text-emerald-400">500,000</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Walk-Forward</label>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                    <span className="text-sm text-white">Train/Test Split</span>
                    <span className="text-sm font-medium text-cyan-400">80/20</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Scoring</label>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                    <span className="text-sm text-white">Composite Formula</span>
                    <span className="text-sm font-medium text-yellow-400">PF × (1 - DD)</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-2">Multiprocessing</label>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                    <span className="text-sm text-white">Workers</span>
                    <span className="text-sm font-medium text-emerald-400">8 cores</span>
                  </div>
                </div>
              </div>
            </motion.div>

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
                    className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg"
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
