"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Flame, AlertCircle, Shield } from "lucide-react";

type AlertLevel = "critical" | "warning" | "info";

interface ToastAlert {
  id: string;
  message: string;
  level: AlertLevel;
  timestamp: string;
  autoDismiss?: boolean;
}

interface ToastAlertProps {
  alerts?: ToastAlert[];
  autoGenerate?: boolean;
}

const ICONS: Record<AlertLevel, typeof X> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Shield,
};

const STYLES: Record<
  AlertLevel,
  { border: string; bg: string; text: string; bar: string }
> = {
  critical: {
    border: "border-red-500/50",
    bg: "bg-red-950/90",
    text: "text-red-300",
    bar: "bg-red-500",
  },
  warning: {
    border: "border-yellow-500/50",
    bg: "bg-yellow-950/90",
    text: "text-yellow-300",
    bar: "bg-yellow-500",
  },
  info: {
    border: "border-cyan-500/50",
    bg: "bg-slate-900/90",
    text: "text-cyan-300",
    bar: "bg-cyan-500",
  },
};

const initialAlerts: ToastAlert[] = [
  {
    id: "alert_001",
    message: "High-impact news: US Non-Farm Payrolls in 15 min",
    level: "critical",
    timestamp: new Date().toISOString(),
    autoDismiss: false,
  },
  {
    id: "alert_002",
    message: "Drawdown at 72% — positions reduced",
    level: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    autoDismiss: true,
  },
];

export default function ToastAlertPopups({
  alerts: propAlerts,
  autoGenerate = true,
}: ToastAlertProps) {
  const [alerts, setAlerts] = useState<ToastAlert[]>(initialAlerts);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (propAlerts) setAlerts(propAlerts);
  }, [propAlerts]);

  // Auto-generate
  useEffect(() => {
    if (!autoGenerate) return;

    const messages = [
      { text: "EURUSD spread widened to 2.5 pips", level: "warning" as AlertLevel },
      { text: "Margin at 85% — close positions", level: "critical" as AlertLevel },
      { text: "Walk-forward failing Strategy #003", level: "warning" as AlertLevel },
      { text: "News window closed — trading resumed", level: "info" as AlertLevel },
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const newAlert: ToastAlert = {
          id: `alert_${Date.now()}`,
          message: msg.text,
          level: msg.level,
          timestamp: new Date().toISOString(),
          autoDismiss: true,
        };
        setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [autoGenerate]);

  // Auto-dismiss
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setAlerts((prev) =>
        prev.filter((alert) => {
          if (!alert.autoDismiss) return true;
          const age = Date.now() - new Date(alert.timestamp).getTime();
          return age < 1000 * 60 * 5;
        })
      );
    }, 10000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const dismissAll = () => {
    setAlerts((prev) => prev.filter((a) => !a.autoDismiss));
  };

  const total = alerts.length;
  const dismissable = alerts.filter((a) => a.autoDismiss).length;

  return (
    <div
      className="fixed top-20 right-6 z-50 flex flex-col gap-3 w-80 sm:w-96 max-w-full pointer-events-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header (when multiple) */}
      {total > 1 && (
        <div className="pointer-events-auto flex items-center justify-between bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-lg px-3 py-1.5">
          <span className="text-xs font-medium text-neutral-400">
            {total} alert{total > 1 ? "s" : ""}
          </span>
          {dismissable > 0 && (
            <button
              onClick={dismissAll}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Dismiss all
            </button>
          )}
        </div>
      )}

      {/* Toast Stack */}
      <AnimatePresence mode="popLayout">
        {alerts.slice(0, 4).map((alert) => {
          const style = STYLES[alert.level];
          const Icon = ICONS[alert.level];

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`pointer-events-auto rounded-lg border ${style.border} ${style.bg} backdrop-blur-sm shadow-xl overflow-hidden`}
            >
              {/* Progress bar */}
              {alert.autoDismiss && (
                <div className="w-full h-0.5 bg-neutral-800">
                  <motion.div
                    className={`h-full ${style.bar}`}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{
                      duration: 300,
                      ease: "linear",
                    }}
                  />
                </div>
              )}

              <div className="flex items-start gap-3 p-3">
                <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${style.text}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${style.text} leading-tight`}>
                    {alert.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0 -mr-1 -mt-1 p-1.5 text-neutral-500 hover:text-neutral-300 hover:bg-white/5 rounded transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Overflow indicator */}
      {alerts.length > 4 && (
        <div className="pointer-events-auto flex items-center justify-center py-1">
          <span className="text-xs text-neutral-500">
            +{alerts.length - 4} more
          </span>
        </div>
      )}
    </div>
  );
}
