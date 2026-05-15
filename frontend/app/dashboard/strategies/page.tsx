import { Metadata } from "next";
import DashboardLayout from "@/app/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Strategies - QuantumTrade",
};

export default function StrategiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategies</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage and monitor your trading strategies
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
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Strategy Management
          </h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            This section will contain detailed strategy configuration,
            backtesting results, and deployment controls.
          </p>
          <p className="text-xs text-neutral-600 mt-4">
            Phase 2 Feature
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
