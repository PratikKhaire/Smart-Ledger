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
        <div className="skeleton" style={{ width: 180, height: 16, marginBottom: 16 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)" }} />
              <div>
                <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 60, height: 12 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 80, height: 16 }} />
          </div>
        ))}
      </div>
    );
  }

  const recent = transactions.slice(0, 5);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Recent Transactions</div>
        <Link
          href="/transactions"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color: "var(--accent-blue)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          No transactions yet. Add your first one!
        </div>
      ) : (
        <div>
          {recent.map((txn, index) => (
            <div
              key={txn.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom:
                  index < recent.length - 1
                    ? "1px solid var(--border-primary)"
                    : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: `${getCategoryColor(txn.category)}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: getCategoryColor(txn.category),
                  }}
                >
                  {txn.category.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    {txn.category}
                    {txn.isShared && (
                      <span className="badge badge-shared" style={{ fontSize: 10, padding: "1px 6px" }}>
                        Split
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {formatTransactionDate(txn.date)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color:
                    txn.type === "INCOME"
                      ? "var(--accent-green)"
                      : "var(--accent-red)",
                }}
              >
                {txn.type === "INCOME" ? "+" : "-"}
                {formatCurrency(txn.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
