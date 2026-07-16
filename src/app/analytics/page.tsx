"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ExpenseTrendChart from "@/components/analytics/expense-trend-chart";
import CategoryBreakdownChart from "@/components/analytics/category-breakdown-chart";
import SummaryCards from "@/components/dashboard/summary-cards";
import SmartInsightCard from "@/components/dashboard/smart-insight-card";
import BudgetProgressCard from "@/components/analytics/budget-progress-card";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import { useSummary } from "@/hooks/use-summary";

export default function AnalyticsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: analytics, isLoading, refetch } = useSummary();

  return (
    <AppShell onAddTransaction={() => setDialogOpen(true)}>
      <div>
        <div className="desktop-only" style={{ flexDirection: "column", gap: 6, marginBottom: 24 }}>
          <h2 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-1.0px", color: "var(--text-primary)", lineHeight: 1.1 }}>
            Analytics
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: 16,
            }}
          >
            {/* Smart Insight */}
            <SmartInsightCard
              insight={analytics?.insight ?? null}
              isLoading={isLoading}
            />

            {/* Budgets */}
            <BudgetProgressCard
              budgets={analytics?.budgets ?? null}
              isLoading={isLoading}
            />
          </div>
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
