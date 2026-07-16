"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatTransactionDate } from "@/lib/utils";
import { getCategoryColor } from "@/lib/utils";
import type { TransactionWithSharedExpense } from "@/types/transaction";

interface RecentTransactionsCardProps {
  transactions: TransactionWithSharedExpense[];
  isLoading: boolean;
}

export default function RecentTransactionsCard({
  transactions,
  isLoading,
}: RecentTransactionsCardProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 150, height: 18, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 4 }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid var(--border-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
              <div>
                <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 60, height: 11 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 70, height: 16 }} />
          </div>
        ))}
      </div>
    );
  }

  const recent = (transactions || []).slice(0, 5);

  return (
    <div
      className="card"
      style={{
        padding: 24,
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
            Recent Transactions
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 6px",
              borderRadius: "5px",
              background: "var(--accent-blue-dim)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              fontSize: "9px",
              fontWeight: 700,
              color: "var(--accent-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Activity
          </div>
        </div>

        <Link
          href="/transactions"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: "12.5px",
            color: "var(--accent-purple)",
            textDecoration: "none",
            fontWeight: 600,
            transition: "opacity var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          No transactions yet. Add your first one!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {recent.map((txn, index) => {
            const isIncome = txn.type === "INCOME";
            const catColor = getCategoryColor(txn.category);
            return (
              <div
                key={txn.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: index < recent.length - 1 ? "1px solid var(--border-primary)" : "none",
                }}
              >
                {/* Left Side: Category Icon & Text Info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Category Initials Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: `${catColor}12`,
                      border: `1px solid ${catColor}24`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: catColor,
                    }}
                  >
                    {txn.category.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    {/* Category Label + Shared Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {txn.category}
                      </span>
                      {txn.isShared && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            padding: "2px 6px",
                            borderRadius: "5px",
                            background: "var(--accent-purple-dim)",
                            border: "1px solid rgba(139, 92, 246, 0.15)",
                            fontSize: "9px",
                            fontWeight: 700,
                            color: "var(--accent-purple)",
                          }}
                        >
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--accent-purple)" }} />
                          Split
                        </span>
                      )}
                    </div>
                    {/* Timestamp */}
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>
                      {formatTransactionDate(txn.date)}
                    </div>
                  </div>
                </div>

                {/* Right Side: Currency Value */}
                <div
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 700,
                    color: isIncome ? "var(--accent-green)" : "var(--text-primary)",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
