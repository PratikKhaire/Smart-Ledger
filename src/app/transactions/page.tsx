"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AppShell from "@/components/layout/app-shell";
import TransactionList from "@/components/transactions/transaction-list";
import TransactionsToolbar from "@/components/transactions/transactions-toolbar";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import { useTransactions } from "@/hooks/use-transactions";

export default function TransactionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const {
    transactions,
    isLoading,
    error,
    refetch,
    deleteTransaction,
    isDeleting,
  } = useTransactions({
    type: (typeFilter as "INCOME" | "EXPENSE") || undefined,
    category: categoryFilter || undefined,
    search: debouncedSearch || undefined,
  });

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <AppShell onAddTransaction={() => setDialogOpen(true)}>
      <div>
        <div className="desktop-only" style={{ flexDirection: "column", gap: 6, marginBottom: 24 }}>
          <h2 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-1.0px", color: "var(--text-primary)", lineHeight: 1.1 }}>
            Transactions
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            View and manage all your income and expense records.
          </p>
        </div>

        <TransactionsToolbar
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          searchQuery={searchQuery}
          onTypeChange={setTypeFilter}
          onCategoryChange={setCategoryFilter}
          onSearchChange={setSearchQuery}
        />

        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          error={error}
          onDelete={deleteTransaction}
          isDeleting={isDeleting}
          onRetry={refetch}
        />
      </div>

      <AddTransactionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </AppShell>
  );
}
