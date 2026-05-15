import { Metadata } from "next";
import DashboardLayout from "@/app/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Positions - QuantumTrade",
};

export default function PositionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Positions</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Monitor your open and closed positions
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Position Management
          </h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            Real-time position tracking with WebSocket updates,
            trade history, and P&L analysis.
          </p>
          <p className="text-xs text-neutral-600 mt-4">Phase 2 Feature</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
