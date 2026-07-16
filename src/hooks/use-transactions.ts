"use client";

import { useState, useEffect, useCallback } from "react";
import type { TransactionWithSharedExpense } from "@/types/transaction";

interface UseTransactionsOptions {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  search?: string;
}

interface UseTransactionsReturn {
  transactions: TransactionWithSharedExpense[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isDeleting: string | null;
}

export function useTransactions(
  options?: UseTransactionsOptions
): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<
    TransactionWithSharedExpense[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.type) params.set("type", options.type);
      if (options?.category) params.set("category", options.category);
      if (options?.search) params.set("search", options.search);

      const queryString = params.toString();
      const url = `/api/transactions${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const json = await res.json();
      setTransactions(json.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [options?.type, options?.category, options?.search]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(id);
        // Optimistic removal
        setTransactions((prev) => prev.filter((t) => t.id !== id));

        const res = await fetch(`/api/transactions/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          // Revert on failure
          await fetchTransactions();
          throw new Error("Failed to delete transaction");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete"
        );
      } finally {
        setIsDeleting(null);
      }
    },
    [fetchTransactions]
  );

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    deleteTransaction: handleDelete,
    isDeleting,
  };
}
