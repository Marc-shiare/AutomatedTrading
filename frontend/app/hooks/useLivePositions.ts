"use client";

import { useState, useEffect, useCallback } from "react";
import { PositionUpdate } from "@/app/types";
import { generateMockPositions } from "@/app/lib/mockData";

export function useLivePositions(initialCount = 4, refreshInterval = 5000) {
  const [positions, setPositions] = useState<PositionUpdate[]>(() =>
    generateMockPositions(initialCount)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      setPositions(generateMockPositions(initialCount));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch positions");
    } finally {
      setIsLoading(false);
    }
  }, [initialCount]);

  const updatePosition = useCallback(
    (symbol: string, updates: Partial<PositionUpdate>) => {
      setPositions((prev) =>
        prev.map((p) => (p.symbol === symbol ? { ...p, ...updates } : p))
      );
    },
    []
  );

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((position) => {
          // Realistic price movements
          const volatility = position.symbol.includes("JPY") ? 0.0005 : 0.00005;
          const priceChange = (Math.random() - 0.5) * volatility;
          const newPrice = Math.max(
            position.current_price + priceChange,
            position.entry_price * 0.98
          );
          const priceDiff = newPrice - position.entry_price;
          const pipValue = position.symbol.includes("JPY") ? 0.01 : 0.0001;
          const pips =
            position.side === "BUY"
              ? priceDiff / pipValue
              : -priceDiff / pipValue;
          const lotSize = position.current_lot_size;
          const pipWorth = pipValue * 100000 * lotSize;

          return {
            ...position,
            current_price: parseFloat(newPrice.toFixed(5)),
            unrealized_pnl: parseFloat((pips * pipWorth).toFixed(2)),
            unrealized_pips: parseFloat(pips.toFixed(2)),
            timestamp: new Date().toISOString(),
            risk_level:
              pips < -20
                ? "critical"
                : pips < -10
                ? "high"
                : pips < 5
                ? "normal"
                : "low",
          };
        })
      );
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { positions, isLoading, error, refresh, updatePosition };
}
