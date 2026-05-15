import { Metadata } from "next";
import DashboardLayout from "@/app/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Optimizer - QuantumTrade",
};

export default function OptimizerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Optimizer</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Run strategy optimization with Optuna
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-neutral-800 mb-4">
            <svg
              className="h-8 w-8 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Strategy Optimizer
          </h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            Run automated parameter optimization using Optuna with
            walk-forward validation and composite scoring.
          </p>
          <p className="text-xs text-neutral-600 mt-4">
            Phase 4 Feature
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
