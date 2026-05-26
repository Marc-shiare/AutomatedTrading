"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import NewsTicker from "@/app/components/NewsTicker";
import { Newspaper, Flame, Clock, Calendar, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { generateMockNews } from "@/app/lib/mockData";

export default function NewsPage() {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const allNews = generateMockNews(10);
  const filteredNews = filter === "all" ? allNews : allNews.filter((n) => n.impact === filter);

  const highCount = allNews.filter((n) => n.impact === "high").length;
  const mediumCount = allNews.filter((n) => n.impact === "medium").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">News &amp; Events</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Upcoming economic events and risk alerts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">High Impact</p>
                <p className="text-2xl font-bold text-white">{highCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Medium Impact</p>
                <p className="text-2xl font-bold text-white">{mediumCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Next 24 Hours</p>
                <p className="text-2xl font-bold text-white">{allNews.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
            {(["all", "high", "medium", "low"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-emerald-500 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Full News Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <NewsTicker news={filteredNews} autoRefresh />
          </div>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Risk Rules</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <Flame className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-400">High Impact Events</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Reduce position sizes by 50% during high-impact news
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">15-Minute Window</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Pause new entries 15 min before and after high-impact events
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
                  <Newspaper className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-cyan-400">Auto-Resume</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Trading automatically resumes after volatility subsides
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
