"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Clock,
  Flame,
  AlertTriangle,
  CircleAlert,
} from "lucide-react";
import { NewsEvent } from "@/app/types";
import { generateMockNews } from "@/app/lib/mockData";

interface NewsTickerProps {
  news?: NewsEvent[];
  autoRefresh?: boolean;
}

type ImpactConfig = {
  color: string;
  bg: string;
  border: string;
  icon: typeof Flame;
  label: string;
};

const IMPACT_CONFIGS: Record<NewsEvent["impact"], ImpactConfig> = {
  high: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: Flame,
    label: "High Impact",
  },
  medium: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: AlertTriangle,
    label: "Medium",
  },
  low: {
    color: "text-neutral-400",
    bg: "bg-neutral-500/10",
    border: "border-neutral-500/20",
    icon: CircleAlert,
    label: "Low",
  },
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) return "Happening now";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "In < 1 hour";
  if (hours < 24) return `In ${hours}h`;
  const days = Math.floor(hours / 24);
  return `In ${days}d`;
}

export default function NewsTicker({ news: initialNews, autoRefresh = true }: NewsTickerProps) {
  const [news, setNews] = useState<NewsEvent[]>(initialNews || generateMockNews(5));

  useEffect(() => {
    if (initialNews) setNews(initialNews);
  }, [initialNews]);

  // Simulate countdown updates
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setNews((prev) =>
        prev.map((item) => {
          const time = new Date(item.scheduled_time);
          time.setMinutes(time.getMinutes() - 5);
          return { ...item, scheduled_time: time.toISOString() };
        })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const highImpactCount = news.filter((n) => n.impact === "high").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">News Ticker</h3>
          <p className="text-sm text-neutral-400 mt-1">Upcoming economic events</p>
        </div>
        <div className="flex items-center gap-2">
          {highImpactCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
              <Flame className="h-3 w-3" />
              {highImpactCount} High Impact
            </span>
          )}
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        {news.map((item, index) => {
          const config = IMPACT_CONFIGS[item.impact];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-lg border ${config.border} ${config.bg} transition-colors hover:opacity-80`}
            >
              <div className={`mt-0.5 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.currency}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-medium text-neutral-400">
                  {formatTime(item.scheduled_time)}
                </span>
              </div>
            </motion.div>
          );
        })}

        {news.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming news events</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
