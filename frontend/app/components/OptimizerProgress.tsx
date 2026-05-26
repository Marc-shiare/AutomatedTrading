"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Zap, Trophy, Timer, BarChart3, TrendingUp } from "lucide-react";
import { OptimizerState } from "@/app/types";
import { generateMockOptimizerState } from "@/app/lib/mockData";

interface OptimizerProgressProps {
  state?: OptimizerState;
  autoSimulate?: boolean;
}

function formatETA(seconds: number): string {
  if (seconds <= 0) return "Complete";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function OptimizerProgress({
  state: initialState,
  autoSimulate = true,
}: OptimizerProgressProps) {
  const [state, setState] = useState<OptimizerState>(initialState || generateMockOptimizerState());
  const [isRunning, setIsRunning] = useState(false);

  const startOptimizer = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);

    setState((prev) => ({
      ...prev,
      status: "running" as const,
    }));
  }, [isRunning]);

  const stopOptimizer = useCallback(() => {
    setIsRunning(false);
    setState((prev) => ({
      ...prev,
      status: "idle" as const,
    }));
  }, []);

  const resetOptimizer = useCallback(() => {
    setIsRunning(false);
    setState(generateMockOptimizerState());
  }, []);

  // Simulation effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.status !== "running") return prev;

        const increment = Math.floor(Math.random() * 2500) + 500;
        const newIteration = Math.min(prev.current_iteration + increment, prev.total_iterations);
        const progress = Math.min(newIteration / prev.total_iterations, 1);
        const remaining = prev.total_iterations - newIteration;
        const eta = Math.floor(remaining / Math.max(increment / 2, 1));

        let bestScore = prev.best_score;
        if (Math.random() > 0.7) {
          bestScore = Math.max(bestScore, Math.random() * 2.0);
        }

        return {
          ...prev,
          current_iteration: newIteration,
          progress: parseFloat(progress.toFixed(4)),
          best_score: parseFloat(bestScore.toFixed(4)),
          eta_seconds: Math.max(eta, 0),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Auto-start simulation
  useEffect(() => {
    if (autoSimulate && state.status === "idle" && state.current_iteration === 0) {
      const timer = setTimeout(() => startOptimizer(), 3000);
      return () => clearTimeout(timer);
    }
  }, [autoSimulate, startOptimizer, state.status, state.current_iteration]);

  // Complete when done
  useEffect(() => {
    if (state.current_iteration >= state.total_iterations && state.status === "running") {
      setIsRunning(false);
      setState((prev) => ({ ...prev, status: "completed", progress: 1, eta_seconds: 0 }));
    }
  }, [state.current_iteration, state.total_iterations, state.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsRunning(false);
    };
  }, []);

  const progressPercent = (state.current_iteration / state.total_iterations) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Optimizer Progress</h3>
          <p className="text-sm text-neutral-400 mt-1">
            {state.status === "running"
              ? "Running parameter optimization..."
              : state.status === "completed"
              ? "Optimization complete"
              : "Ready to start optimization"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.status === "running" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Running
            </span>
          ) : state.status === "completed" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
              <Trophy className="h-3 w-3" />
              Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-400">
              Idle
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-500">
            {state.current_iteration.toLocaleString()} / {state.total_iterations.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-white">
            {progressPercent.toFixed(2)}%
          </span>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-neutral-500">Best Score</span>
          </div>
          <p className="text-lg font-bold text-white">{state.best_score.toFixed(4)}</p>
        </div>
        <div className="bg-neutral-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-neutral-500">Iterations</span>
          </div>
          <p className="text-lg font-bold text-white">{state.current_iteration.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-neutral-500">ETA</span>
          </div>
          <p className="text-lg font-bold text-white">{formatETA(state.eta_seconds)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {state.status === "running" ? (
          <button
            onClick={stopOptimizer}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        ) : state.status === "completed" ? (
          <button
            onClick={resetOptimizer}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </button>
        ) : (
          <button
            onClick={startOptimizer}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="h-4 w-4" />
            Start
          </button>
        )}
        {state.status !== "idle" && (
          <button
            onClick={resetOptimizer}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </motion.div>
  );
}
