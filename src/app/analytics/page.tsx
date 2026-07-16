"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ExpenseTrendChart from "@/components/analytics/expense-trend-chart";
import CategoryBreakdownChart from "@/components/analytics/category-breakdown-chart";
import SummaryCards from "@/components/dashboard/summary-cards";
import SmartInsightCard from "@/components/dashboard/smart-insight-card";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import { useSummary } from "@/hooks/use-summary";

export default function AnalyticsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: analytics, isLoading, refetch } = useSummary();

  return (
    <AppShell onAddTransaction={() => setDialogOpen(true)}>
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Analytics
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Understand your spending patterns and financial health.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary KPIs */}
          <SummaryCards
            data={analytics?.summary ?? null}
            isLoading={isLoading}
          />

          {/* Charts grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: 16,
            }}
          >
            <ExpenseTrendChart
              data={analytics?.monthlyTrend ?? []}
              isLoading={isLoading}
            />
            <CategoryBreakdownChart
              data={analytics?.categoryBreakdown ?? []}
              isLoading={isLoading}
            />
          </div>

          {/* Smart Insight */}
          <SmartInsightCard
            insight={analytics?.insight ?? null}
            isLoading={isLoading}
          />
        </div>
      </div>

      <AddTransactionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={refetch}
      />
    </AppShell>
  );
}
