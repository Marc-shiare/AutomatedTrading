"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Link2,
  Unlink,
  ShieldAlert,
  Activity,
  TrendingUp,
  DollarSign,
  Scale,
  Pause,
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import type { MT5ConnectionStatus, MT5AccountInfo } from "@/app/types";
import {
  getMT5Status,
  connectMT5,
  disconnectMT5,
  stopMT5Trading,
  emergencyCloseMT5,
  updateMT5Params,
  getMT5Account,
  getMT5Positions,
} from "@/app/lib/api";
import { generateMockMT5Status } from "@/app/lib/mockData";

type ConnectionState = "connected" | "disconnected" | "connecting" | "error";

interface MT5Position {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  lots: number;
  openPrice: number;
  currentPrice?: number;
  profit?: number;
  status: "open";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function MT5Page() {
  const [status, setStatus] = useState<MT5ConnectionStatus | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [host, setHost] = useState("127.0.0.1");
  const [port, setPort] = useState(5555);
  const [positions, setPositions] = useState<MT5Position[]>([]);
  const [account, setAccount] = useState<MT5AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Poll status every 5s
  const refresh = useCallback(async () => {
    try {
      const s = await getMT5Status();
      setStatus(s);
      setConnectionState(s.connected ? "connected" : "disconnected");
      if (s.account_info) {
        setAccount(s.account_info);
      }
    } catch {
      setConnectionState("error");
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Fetch positions when connected
  useEffect(() => {
    if (!status?.connected) return;
    getMT5Positions().then((data) => {
      setPositions(
        (data?.positions || []).map((p: any) => ({
          id: p.id || Math.random(),
          symbol: p.symbol || "",
          side: (p.side as "BUY" | "SELL") || "BUY",
          lots: p.lots || p.volume || 0,
          openPrice: p.openPrice || p.price_open || 0,
          currentPrice: p.currentPrice || p.price_current,
          profit: p.profit || 0,
          status: "open",
        }))
      );
    });
    getMT5Account().then((a) => {
      if (a) setAccount(a);
    });
  }, [status?.connected]);

  const handleConnect = async () => {
    setLoading(true);
    setMessage(null);
    try {
      setConnectionState("connecting");
      const res = await connectMT5(host, port);
      if (res?.status === "connected") {
        setConnectionState("connected");
        setMessage(`Connected to ${host}:${port}`);
      } else {
        setConnectionState("error");
        setMessage("Connection failed");
      }
    } catch {
      setConnectionState("error");
      setMessage("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectMT5();
      setConnectionState("disconnected");
      setMessage("Disconnected");
    } catch {
      setMessage("Disconnect failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await stopMT5Trading();
      setMessage("Trading stopped");
    } catch {
      setMessage("Stop trading failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = async () => {
    if (!confirm("Emergency close all MT5 positions?")) return;
    setLoading(true);
    try {
      await emergencyCloseMT5();
      setMessage("Emergency close sent");
    } catch {
      setMessage("Emergency close failed");
    } finally {
      setLoading(false);
    }
  };

  const indicatorColor =
    connectionState === "connected"
      ? "bg-emerald-500"
      : connectionState === "connecting"
      ? "bg-yellow-500 animate-pulse"
      : connectionState === "error"
      ? "bg-red-500"
      : "bg-neutral-500";

  const info = account;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">MT5 Bridge</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Monitor and control your MetaTrader 5 connection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${indicatorColor}`} />
            <span className="text-sm text-neutral-400 capitalize">{connectionState}</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Balance" value={info ? formatCurrency(info.balance) : "--"} delay={0} />
          <StatCard icon={TrendingUp} label="Equity" value={info ? formatCurrency(info.equity) : "--"} delay={0.1} />
          <StatCard icon={Scale} label="Free Margin" value={info ? formatCurrency(info.free_margin) : "--"} delay={0.2} />
          <StatCard icon={Activity} label="Profit" value={info ? formatCurrency(info.profit) : "--"} delay={0.3} color={info && info.profit >= 0 ? "text-emerald-400" : "text-red-400"} />
        </div>

        {/* Connection Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Connection</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-neutral-500 mb-1">Host</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="127.0.0.1"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-neutral-500 mb-1">Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                disabled={loading || connectionState === "connected"}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Link2 className="h-4 w-4" />
                Connect
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading || connectionState === "disconnected"}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Unlink className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-wrap gap-3">
            <button
              onClick={handleStop}
              disabled={loading || connectionState !== "connected"}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Pause className="h-4 w-4" />
              Stop Trading
            </button>
            <button
              onClick={handleEmergency}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              Emergency Close
            </button>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-neutral-400"
            >
              {message}
            </motion.div>
          )}
        </motion.div>

        {/* Positions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-neutral-800">
            <h3 className="text-lg font-semibold text-white">Open Positions</h3>
          </div>
          {positions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-neutral-400">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-800/50">
                  <tr>
                    <th className="px-6 py-3">Symbol</th>
                    <th className="px-6 py-3">Side</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3">Entry</th>
                    <th className="px-6 py-3">Current</th>
                    <th className="px-6 py-3">P&amp;L</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{pos.symbol}</td>
                      <td className={`px-6 py-4 ${pos.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}>{pos.side}</td>
                      <td className="px-6 py-4">{pos.lots.toFixed(2)}</td>
                      <td className="px-6 py-4">{pos.openPrice.toFixed(5)}</td>
                      <td className="px-6 py-4">{pos.currentPrice ? pos.currentPrice.toFixed(5) : "--"}</td>
                      <td className={`px-6 py-4 ${(pos.profit || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {pos.profit !== undefined ? formatCurrency(pos.profit) : "--"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          Open
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-neutral-500 text-sm">
              No open positions
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delay?: number;
  color?: string;
}

function StatCard({ icon: Icon, label, value, delay = 0, color = "text-white" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center">
          <Icon className="h-5 w-5 text-neutral-400" />
        </div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
}