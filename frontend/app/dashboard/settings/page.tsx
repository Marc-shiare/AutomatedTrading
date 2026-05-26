"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Settings,
  Bell,
  Shield,
  Key,
  Server,
  Moon,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type SettingSection = "general" | "notifications" | "risk" | "api" | "mt5";

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        enabled ? "bg-emerald-500" : "bg-neutral-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<SettingSection>("general");
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    darkMode: true,
    compactView: false,
    autoRefresh: true,
    refreshInterval: 5,
    timezone: "UTC",
    currency: "USD",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    tradeExecutions: true,
    optimizerComplete: true,
    riskAlerts: true,
    newsAlerts: true,
  });

  const [risk, setRisk] = useState({
    maxDailyDrawdown: 10,
    maxPositionSize: 2.0,
    maxOpenPositions: 6,
    riskPerTrade: 2.0,
    positionReduction: 50,
    autoKillSwitch: true,
  });

  const [mt5, setMt5] = useState({
    autoReconnect: true,
    reconnectInterval: 30,
    defaultLotSize: 0.5,
    magicNumber: 123456,
    symbolPrefix: "",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setGeneral({ darkMode: true, compactView: false, autoRefresh: true, refreshInterval: 5, timezone: "UTC", currency: "USD" });
    setNotifications({ emailAlerts: true, pushNotifications: false, tradeExecutions: true, optimizerComplete: true, riskAlerts: true, newsAlerts: true });
    setRisk({ maxDailyDrawdown: 10, maxPositionSize: 2.0, maxOpenPositions: 6, riskPerTrade: 2.0, positionReduction: 50, autoKillSwitch: true });
    setMt5({ autoReconnect: true, reconnectInterval: 30, defaultLotSize: 0.5, magicNumber: 123456, symbolPrefix: "" });
  };

  const sections = [
    { id: "general" as SettingSection, label: "General", icon: Settings },
    { id: "notifications" as SettingSection, label: "Notifications", icon: Bell },
    { id: "risk" as SettingSection, label: "Risk", icon: Shield },
    { id: "api" as SettingSection, label: "API Keys", icon: Key },
    { id: "mt5" as SettingSection, label: "MetaTrader 5", icon: Server },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configure platform behavior and preferences
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                section === s.id
                  ? "bg-emerald-500 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          {section === "general" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Dark Mode</p>
                  <p className="text-xs text-neutral-500">Use dark theme for dashboard</p>
                </div>
                <Toggle enabled={general.darkMode} onChange={() => setGeneral({ ...general, darkMode: !general.darkMode })} />
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Auto Refresh</p>
                  <p className="text-xs text-neutral-500">Automatically refresh dashboard data</p>
                </div>
                <Toggle enabled={general.autoRefresh} onChange={() => setGeneral({ ...general, autoRefresh: !general.autoRefresh })} />
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Compact View</p>
                  <p className="text-xs text-neutral-500">Reduce spacing and padding in UI</p>
                </div>
                <Toggle enabled={general.compactView} onChange={() => setGeneral({ ...general, compactView: !general.compactView })} />
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                    </p>
                  </div>
                  <Toggle
                    enabled={value}
                    onChange={() => setNotifications({ ...notifications, [key]: !value })}
                  />
                </div>
              ))}
            </div>
          )}

          {section === "risk" && (
            <div className="space-y-6">
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Risk Management</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      These settings directly affect your trading. Changes apply immediately.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Max Daily Drawdown</p>
                  <p className="text-xs text-neutral-500">Close all positions at this drawdown level (%)</p>
                </div>
                <input
                  type="number"
                  value={risk.maxDailyDrawdown}
                  onChange={(e) => setRisk({ ...risk, maxDailyDrawdown: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Risk Per Trade</p>
                  <p className="text-xs text-neutral-500">Percentage of equity risked per trade (%)</p>
                </div>
                <input
                  type="number"
                  value={risk.riskPerTrade}
                  onChange={(e) => setRisk({ ...risk, riskPerTrade: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}

          {section === "api" && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-cyan-400">API Configuration</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Backend API and third-party service keys.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-500 text-center py-8">
                API key management coming in Phase 3
              </p>
            </div>
          )}

          {section === "mt5" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Auto Reconnect</p>
                  <p className="text-xs text-neutral-500">Automatically reconnect to MT5 on disconnect</p>
                </div>
                <Toggle enabled={mt5.autoReconnect} onChange={() => setMt5({ ...mt5, autoReconnect: !mt5.autoReconnect })} />
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Default Lot Size</p>
                  <p className="text-xs text-neutral-500">Default size for new positions</p>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={mt5.defaultLotSize}
                  onChange={(e) => setMt5({ ...mt5, defaultLotSize: Number(e.target.value) })}
                  className="w-24 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Magic Number</p>
                  <p className="text-xs text-neutral-500">Unique identifier for EA trades</p>
                </div>
                <input
                  type="number"
                  value={mt5.magicNumber}
                  onChange={(e) => setMt5({ ...mt5, magicNumber: Number(e.target.value) })}
                  className="w-24 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-emerald-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              Settings saved
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
