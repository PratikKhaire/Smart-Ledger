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
import { LayoutDashboard, BarChart3, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

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
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        
        {/* Desktop Page Title (Amanda Smith Style Tasks Page layout) */}
        <div className="desktop-only" style={{ flexDirection: "column", gap: 16 }}>
          <h2 
            style={{ 
              fontSize: "30px", 
              fontWeight: 800, 
              letterSpacing: "-1px", 
              color: "var(--text-primary)",
              lineHeight: 1.1 
            }}
          >
            Dashboard
          </h2>
          
          {/* Segmented Control Switcher matching screenshot Board/List tabs */}
          <div className="segmented-control">
            <button className="segmented-item segmented-item-active">
              <LayoutDashboard size={14} style={{ color: "var(--accent-purple)" }} />
              Board View
            </button>
            <Link href="/analytics" style={{ textDecoration: "none" }}>
              <button className="segmented-item">
                <BarChart3 size={14} />
                Analytics
              </button>
            </Link>
            <Link href="/transactions" style={{ textDecoration: "none" }}>
              <button className="segmented-item">
                <ArrowLeftRight size={14} />
                Transactions
              </button>
            </Link>
          </div>
        </div>

        {/* KPI Cards Section */}
        <section aria-label="Financial summary">
          <SummaryCards
            data={analytics?.summary ?? null}
            isLoading={analyticsLoading}
          />
        </section>

        {/* Smart Insight + Category Chart Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
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

        {/* Recent Transactions Section */}
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
