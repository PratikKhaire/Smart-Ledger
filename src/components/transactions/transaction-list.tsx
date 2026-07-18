"use client";

import { useState, useCallback } from "react";
import { formatCurrency } from "@/lib/currency";
import { formatTransactionDate, getCategoryColor } from "@/lib/utils";
import { Trash2, Users, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Share2, Check } from "lucide-react";
import type { TransactionWithSharedExpense } from "@/types/transaction";

interface TransactionListProps {
  transactions: TransactionWithSharedExpense[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
  isDeleting: string | null;
  onRetry: () => void;
}

export default function TransactionList({
  transactions,
  isLoading,
  error,
  onDelete,
  isDeleting,
  onRetry,
}: TransactionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleShare = useCallback(async (e: React.MouseEvent, txnId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/shared-expenses/${txnId}/share`, { method: "POST" });
      const data = await res.json();
      if (data.data?.shareToken) {
        const url = `${window.location.origin}/shared/${data.data.shareToken}`;
        await navigator.clipboard.writeText(url);
        setCopiedShareId(txnId);
        setTimeout(() => setCopiedShareId(null), 2000);
      }
    } catch {
      // silent
    }
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)" }} />
                <div>
                  <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: 80, height: 12 }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: 90, height: 18 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
        <AlertCircle size={40} color="var(--accent-red)" style={{ margin: "0 auto 12px" }} />
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Failed to load transactions</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>{error}</div>
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📒</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No transactions found</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Add your first transaction or adjust your filters.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {transactions.map((txn) => {
        const isExpanded = expandedId === txn.id;
        return (
          <div
            key={txn.id}
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              opacity: isDeleting === txn.id ? 0.5 : 1,
              transition: "opacity var(--transition-fast)",
            }}
          >
            {/* Main row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                cursor: txn.isShared ? "pointer" : "default",
              }}
              onClick={() => txn.isShared && toggleExpand(txn.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-sm)",
                    background: `${getCategoryColor(txn.category)}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: getCategoryColor(txn.category),
                    flexShrink: 0,
                  }}
                >
                  {txn.category.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{txn.category}</span>
                    <span className={`badge badge-${txn.type.toLowerCase()}`}>
                      {txn.type}
                    </span>
                    {txn.isShared && (
                      <span className="badge badge-shared">
                        <Users size={10} /> Split
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {formatTransactionDate(txn.date)}
                    {txn.note && (
                      <>
                        {" · "}
                        <span style={{ color: "var(--text-secondary)" }}>{txn.note}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: txn.type === "INCOME" ? "var(--accent-green)" : "var(--accent-red)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {txn.type === "INCOME" ? "+" : "-"}{formatCurrency(txn.amount)}
                </div>

                {txn.isShared && (
                  <>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: 28, height: 28, color: copiedShareId === txn.id ? "var(--accent-green)" : "var(--text-secondary)" }}
                      onClick={(e) => handleShare(e, txn.id)}
                      aria-label="Copy share link"
                      title={copiedShareId === txn.id ? "Copied!" : "Copy share link"}
                    >
                      {copiedShareId === txn.id ? <Check size={13} /> : <Share2 size={13} />}
                    </button>
                    <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </>
                )}

                <button
                  className="btn btn-ghost btn-icon"
                  style={{ width: 28, height: 28, color: "var(--accent-red)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(txn.id);
                  }}
                  disabled={isDeleting === txn.id}
                  aria-label={`Delete ${txn.category} transaction`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Expanded shared expense details */}
            {isExpanded && txn.sharedExpense && (
              <div
                style={{
                  padding: "12px 20px 16px",
                  borderTop: "1px solid var(--border-primary)",
                  background: "var(--bg-elevated)",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Split Details ({txn.sharedExpense.splitMethod.toLowerCase()} split)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                  {txn.sharedExpense.participants.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "var(--bg-card)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-purple)" }}>
                        {formatCurrency(p.owedAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
