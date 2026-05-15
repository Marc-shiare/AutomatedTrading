import { Metadata } from "next";
import DashboardLayout from "@/app/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Performance - QuantumTrade",
};

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Detailed performance analytics and reports
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
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Performance Analytics
          </h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            In-depth performance metrics, equity curves, trade distribution,
            and strategy comparison tools.
          </p>
          <p className="text-xs text-neutral-600 mt-4">Phase 2 Feature</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
