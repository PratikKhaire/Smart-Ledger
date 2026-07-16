"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SplitPreviewInput } from "@/schemas/shared-expense";

interface SplitPreviewResult {
  participants: { name: string; owedAmount: number }[];
  totalAmount: number;
  splitMethod: string;
  isValid: boolean;
  difference?: number;
}

interface UseSplitPreviewReturn {
  preview: SplitPreviewResult | null;
  isLoading: boolean;
  error: string | null;
  fetchPreview: (input: SplitPreviewInput) => void;
}

export function useSplitPreview(): UseSplitPreviewReturn {
  const [preview, setPreview] = useState<SplitPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPreview = useCallback((input: SplitPreviewInput) => {
    // Debounce to avoid excessive API calls during typing
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/shared-expenses/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!res.ok) {
          throw new Error("Failed to calculate split preview");
        }

        const json = await res.json();
        setPreview(json.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Preview calculation failed"
        );
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { preview, isLoading, error, fetchPreview };
}
