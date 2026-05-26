"use client";

import { Suspense as ReactSuspense, ReactNode } from "react";
import { motion } from "framer-motion";
import { Zap, CircleAlert } from "lucide-react";

// ── Loading Spinner ──────────────────────────────────────────────────

export function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ width: size, height: size }}
      className="rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0"
    >
      <Zap className="h-5 w-5 text-white" />
    </motion.div>
  );
}

// ── Page Loading State ───────────────────────────────────────────────

export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner />
        <p className="text-sm text-neutral-400">{message}</p>
      </div>
    </div>
  );
}

// ── Component Loading State ──────────────────────────────────────────

export function ComponentLoading({ height = 200 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: height }}>
      <div className="flex items-center gap-3">
        <LoadingSpinner size={28} />
        <span className="text-sm text-neutral-500">Loading...</span>
      </div>
    </div>
  );
}

// ── Error Display ────────────────────────────────────────────────────

export function ErrorDisplay({
  title = "Something went wrong",
  message = "An unexpected error occurred",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <CircleAlert className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-neutral-500 mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// ── Suspense Wrapper ─────────────────────────────────────────────────

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingHeight?: number;
}

export function AsyncBoundary({
  children,
  fallback,
  loadingHeight,
}: AsyncBoundaryProps) {
  return (
    <ReactSuspense
      fallback={fallback || <ComponentLoading height={loadingHeight} />}
    >
      {children}
    </ReactSuspense>
  );
}
