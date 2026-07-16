"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnalyticsSummary } from "@/types/api";

interface UseSummaryReturn {
  data: AnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSummary(): UseSummaryReturn {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/analytics/summary");
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}
