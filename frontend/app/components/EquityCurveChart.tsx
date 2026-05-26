"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface EquityPoint {
  date: string;
  equity: number;
}

function generateEquityCurve(): EquityPoint[] {
  const data: EquityPoint[] = [];
  let equity = 10000;
  const startDate = new Date("2024-01-01");

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Simulate more realistic equity curve with trends and drawdowns
    const trend = Math.sin(i / 10) * 50; // Long-term trend
    const dayReturn = (Math.random() - 0.48) * 200 + trend;
    equity = Math.max(equity + dayReturn, 9000);

    data.push({
      date: date.toISOString().split("T")[0],
      equity: parseFloat(equity.toFixed(2)),
    });
  }

  return data;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value}`;
}

export default function EquityCurveChart() {
  const data = useMemo(() => generateEquityCurve(), []);

  const stats = useMemo(() => {
    const first = data[0]?.equity || 10000;
    const last = data[data.length - 1]?.equity || 10000;
    const max = Math.max(...data.map((d) => d.equity));
    const min = Math.min(...data.map((d) => d.equity));
    const returnPct = ((last - first) / first) * 100;

    return { returnPct, max, min, first, last };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Portfolio value over last 90 days
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${stats.returnPct >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {stats.returnPct >= 0 ? "+" : ""}
            {stats.returnPct.toFixed(1)}% total return
          </span>
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-neutral-400">Portfolio</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#262626"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#737373", fontSize: 11 }}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              stroke="#404040"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrency(value)}
              stroke="#404040"
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 500", "dataMax + 500"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #262626",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Equity",
              ]}
              labelFormatter={(label) => {
                if (!label) return "";
                const date = new Date(String(label));
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#equityGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#10b981",
                stroke: "#171717",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
