"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Zap, Shield, Server, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { MT5ConnectionStatus, DashboardSummary } from "@/app/types";
import { generateMockDashboardSummary, generateMockMT5Status } from "@/app/lib/mockData";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  delay?: number;
  highlight?: boolean;
}

function KPICard({ title, value, change, changeType = "neutral", icon: Icon, delay = 0, highlight }: KPICardProps) {
  const changeColors = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: "text-neutral-400",
  };

  const ChangeIcon = changeType === "positive" ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors ${
        highlight ? "border-emerald-500/30" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${changeColors[changeType]}`}>
              <ChangeIcon className="h-4 w-4" />
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-2.5 bg-neutral-800/50 rounded-lg">
          <Icon className="h-5 w-5 text-neutral-400" />
        </div>
      </div>
    </motion.div>
  );
}

export default function KPICards() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [mt5Status, setMt5Status] = useState<MT5ConnectionStatus | null>(null);

  useEffect(() => {
    setSummary(() => generateMockDashboardSummary());
    setMt5Status(() => generateMockMT5Status());
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        title="Total P&L"
        value={summary ? formatCurrency(summary.total_pnl) : "$0.00"}
        change="+12.5%"
        changeType="positive"
        icon={TrendingUp}
        delay={0}
      />
      <KPICard
        title="Win Rate"
        value={summary ? `${(summary.win_rate * 100).toFixed(1)}%` : "0%"}
        change="+2.1%"
        changeType="positive"
        icon={Activity}
        delay={0.1}
      />
      <KPICard
        title="Lots Traded"
        value={summary ? summary.total_lots_traded.toFixed(2) : "0.00"}
        change="Active"
        changeType="neutral"
        icon={Zap}
        delay={0.2}
      />
      <KPICard
        title="Max Drawdown"
        value={summary ? `${(summary.max_drawdown * 100).toFixed(1)}%` : "0%"}
        change="-1.2%"
        changeType="positive"
        icon={Shield}
        delay={0.3}
      />
      <KPICard
        title="MT5 Status"
        value={mt5Status ? (mt5Status.connected ? "Connected" : "Disconnected") : "..."}
        change={mt5Status?.alive ? "Heartbeat Active" : "No Response"}
        changeType={mt5Status?.alive ? "positive" : "negative"}
        icon={Server}
        delay={0.4}
        highlight={true}
      />
    </div>
  );
}
