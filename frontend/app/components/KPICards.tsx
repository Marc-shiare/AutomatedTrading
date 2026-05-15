"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  delay?: number;
}

function KPICard({ title, value, change, changeType = "neutral", icon: Icon, delay = 0 }: KPICardProps) {
  const changeColors = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: "text-neutral-400",
  };

  const ChangeIcon = changeType === "positive" ? ArrowUpRight : changeType === "negative" ? ArrowDownRight : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${changeColors[changeType]}`}>
              {ChangeIcon && <ChangeIcon className="h-4 w-4" />}
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total P&L"
        value="+$4,832.50"
        change="+12.5%"
        changeType="positive"
        icon={TrendingUp}
        delay={0}
      />
      <KPICard
        title="Win Rate"
        value="62.3%"
        change="+2.1%"
        changeType="positive"
        icon={Activity}
        delay={0.1}
      />
      <KPICard
        title="Active Strategies"
        value="4"
        change="2 pending"
        changeType="neutral"
        icon={Zap}
        delay={0.2}
      />
      <KPICard
        title="Max Drawdown"
        value="8.4%"
        change="-1.2%"
        changeType="positive"
        icon={Shield}
        delay={0.3}
      />
    </div>
  );
}
