"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-pulse ${className}`}
    >
      <div className="h-5 w-32 bg-neutral-800 rounded mb-2" />
      <div className="h-4 w-48 bg-neutral-800/50 rounded mb-6" />
      <div className="space-y-3">
        <div className="h-10 bg-neutral-800 rounded" />
        <div className="h-10 bg-neutral-800 rounded" />
        <div className="h-10 bg-neutral-800 rounded" />
      </div>
    </motion.div>
  );
}

export function SkeletonKPI({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-5 animate-pulse ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-neutral-800 rounded mb-2" />
          <div className="h-8 w-32 bg-neutral-800 rounded" />
          <div className="h-4 w-16 bg-neutral-800/50 rounded mt-1" />
        </div>
        <div className="h-10 w-10 bg-neutral-800 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-pulse ${className}`}>
      <div className="h-5 w-32 bg-neutral-800 rounded mb-2" />
      <div className="h-4 w-48 bg-neutral-800/50 rounded mb-6" />
      <div className="h-[250px] bg-neutral-800/30 rounded-lg" />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

import { Component } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-300/70">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
