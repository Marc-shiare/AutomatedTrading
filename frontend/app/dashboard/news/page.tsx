import { Metadata } from "next";
import DashboardLayout from "@/app/components/DashboardLayout";

export const metadata: Metadata = {
  title: "News - QuantumTrade",
};

export default function NewsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">News &amp; Events</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Upcoming economic events and news feed
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v1m-4 3h.001M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            News Ticker
          </h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            Real-time news monitoring with impact analysis,
            auto-position sizing adjustments, and risk alerts.
          </p>
          <p className="text-xs text-neutral-600 mt-4">Phase 2 Feature</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
