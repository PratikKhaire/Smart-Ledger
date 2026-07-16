"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import SummaryCards from "@/components/dashboard/summary-cards";
import SmartInsightCard from "@/components/dashboard/smart-insight-card";
import SpendingByCategoryChart from "@/components/dashboard/spending-by-category-chart";
import RecentTransactionsCard from "@/components/dashboard/recent-transactions-card";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import { useSummary } from "@/hooks/use-summary";
import { useTransactions } from "@/hooks/use-transactions";

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useSummary();
  const { transactions, isLoading: txnLoading, refetch: refetchTransactions } = useTransactions();

  const handleSuccess = () => {
    refetchAnalytics();
    refetchTransactions();
  };

  return (
    <AppShell onAddTransaction={() => setDialogOpen(true)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* KPI Cards */}
        <section aria-label="Financial summary">
          <SummaryCards
            data={analytics?.summary ?? null}
            isLoading={analyticsLoading}
          />
        </section>

        {/* Smart Insight + Category Chart row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          <SmartInsightCard
            insight={analytics?.insight ?? null}
            isLoading={analyticsLoading}
          />
          <SpendingByCategoryChart
            data={analytics?.categoryBreakdown ?? []}
            isLoading={analyticsLoading}
          />
        </div>

        {/* Recent Transactions */}
        <section aria-label="Recent transactions">
          <RecentTransactionsCard
            transactions={transactions}
            isLoading={txnLoading}
          />
        </section>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </AppShell>
  );
}
