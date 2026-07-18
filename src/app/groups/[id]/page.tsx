"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import AddGroupExpenseDialog from "@/components/groups/add-group-expense-dialog";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import {
  Users, Plus, Link as LinkIcon, Copy, Check, ArrowLeft,
  TrendingDown, Loader2, CheckCircle, Circle, Trash2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatTransactionDate, getCategoryColor } from "@/lib/utils";

interface GroupMember {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface GroupSplit {
  id: string;
  userId: string;
  owedAmount: number;
  isPaid: boolean;
  paidAt: string | null;
  user: { id: string; name: string | null; email: string };
}

interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  splitMethod: string;
  addedById: string;
  addedBy: { id: string; name: string | null; email: string };
  splits: GroupSplit[];
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  myRole: string;
  members: GroupMember[];
  expenses: GroupExpense[];
  balanceSummary: { userId: string; name: string; balance: number }[];
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [txnDialogOpen, setTxnDialogOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [togglingPaid, setTogglingPaid] = useState<string | null>(null);

  // Get current user id
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user?.id) setCurrentUserId(d.user.id);
    });
  }, []);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      const data = await res.json();
      if (res.ok) setGroup(data.data);
      else if (res.status === 403) router.push("/groups");
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const copyInviteLink = async () => {
    if (!group) return;
    const url = `${window.location.origin}/join/${group.inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const togglePaid = async (expenseId: string, splitId: string, currentPaid: boolean) => {
    setTogglingPaid(splitId);
    try {
      await fetch(`/api/groups/${id}/splits/${splitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: !currentPaid }),
      });
      await fetchGroup();
    } finally {
      setTogglingPaid(null);
    }
  };

  if (isLoading) {
    return (
      <AppShell onAddTransaction={() => setTxnDialogOpen(true)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton" style={{ width: 200, height: 32 }} />
          <div className="skeleton" style={{ width: "100%", height: 120, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: "100%", height: 200, borderRadius: 12 }} />
        </div>
      </AppShell>
    );
  }

  if (!group) return null;

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${group.inviteCode}`;
  const myBalance = group.balanceSummary.find((b) => b.userId === currentUserId);

  return (
    <AppShell onAddTransaction={() => setTxnDialogOpen(true)}>
      <div>
        {/* Back + header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/groups" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={20} />
          </Link>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.1 }}>
              {group.name}
            </h2>
            {group.description && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{group.description}</p>
            )}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddExpenseOpen(true)}>
            <Plus size={14} />
            Add Expense
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }} className="group-grid">

          {/* Left: Expenses */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* My balance chip */}
            {myBalance && (
              <div
                style={{
                  padding: "12px 18px",
                  background: myBalance.balance >= 0 ? "var(--accent-green-dim)" : "var(--accent-red-dim)",
                  borderRadius: 10,
                  border: `1px solid ${myBalance.balance >= 0 ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {myBalance.balance >= 0 ? "You are owed" : "You owe the group"}
                </span>
                <span
                  style={{
                    fontSize: 20, fontWeight: 800,
                    color: myBalance.balance >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                  }}
                >
                  {formatCurrency(Math.abs(myBalance.balance))}
                </span>
              </div>
            )}

            {/* Expenses list */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Group Expenses</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{group.expenses.length} total</span>
              </div>

              {group.expenses.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  No expenses yet. Add the first one!
                </div>
              ) : (
                group.expenses.map((exp, idx) => {
                  const mySplit = exp.splits.find((s) => s.userId === currentUserId);
                  const isAdder = exp.addedById === currentUserId;

                  return (
                    <div
                      key={exp.id}
                      style={{
                        padding: "16px 20px",
                        borderBottom: idx < group.expenses.length - 1 ? "1px solid var(--border-primary)" : "none",
                      }}
                    >
                      {/* Expense row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                              background: `${getCategoryColor(exp.category)}15`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 800, color: getCategoryColor(exp.category),
                            }}
                          >
                            {exp.category.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{exp.description}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {formatTransactionDate(exp.date)} · by {exp.addedBy.name || exp.addedBy.email.split("@")[0]}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(exp.amount)}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{exp.splitMethod.toLowerCase()} split</div>
                        </div>
                      </div>

                      {/* My split status */}
                      {mySplit && !isAdder && (
                        <div
                          style={{
                            marginTop: 10, display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: mySplit.isPaid ? "var(--accent-green-dim)" : "var(--bg-elevated)",
                            borderRadius: 8,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {mySplit.isPaid
                              ? <CheckCircle size={14} color="var(--accent-green)" />
                              : <Circle size={14} color="var(--text-muted)" />
                            }
                            <span style={{ fontSize: 13, fontWeight: 500, color: mySplit.isPaid ? "var(--accent-green)" : "var(--text-secondary)" }}>
                              Your share: {formatCurrency(mySplit.owedAmount)}
                              {mySplit.isPaid && " · Paid"}
                            </span>
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 12, color: mySplit.isPaid ? "var(--text-muted)" : "var(--accent-purple)" }}
                            onClick={() => togglePaid(exp.id, mySplit.id, mySplit.isPaid)}
                            disabled={togglingPaid === mySplit.id}
                          >
                            {togglingPaid === mySplit.id
                              ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                              : mySplit.isPaid ? "Mark unpaid" : "Mark paid"
                            }
                          </button>
                        </div>
                      )}

                      {/* All splits summary */}
                      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {exp.splits.map((s) => (
                          <span
                            key={s.id}
                            style={{
                              fontSize: 11, padding: "2px 8px",
                              borderRadius: 999,
                              background: s.isPaid ? "var(--accent-green-dim)" : "var(--bg-elevated)",
                              color: s.isPaid ? "var(--accent-green)" : "var(--text-muted)",
                              border: `1px solid ${s.isPaid ? "rgba(16,185,129,0.2)" : "var(--border-primary)"}`,
                            }}
                          >
                            {s.user.name || s.user.email.split("@")[0]}: {formatCurrency(s.owedAmount)}
                            {s.isPaid && " ✓"}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Members + Invite + Balances */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Invite link */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <LinkIcon size={14} color="var(--accent-purple)" />
                Invite Link
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-elevated)",
                  borderRadius: 8, fontSize: 11,
                  color: "var(--text-muted)",
                  wordBreak: "break-all",
                  marginBottom: 10,
                }}
              >
                {inviteUrl}
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={copyInviteLink}>
                {copiedInvite ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy Invite Link</>}
              </button>
            </div>

            {/* Members */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={14} color="var(--accent-blue)" />
                Members ({group.members.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.members.map((m) => {
                  const balance = group.balanceSummary.find((b) => b.userId === m.userId);
                  const name = m.user.name || m.user.email.split("@")[0];
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800, color: "var(--text-secondary)",
                            flexShrink: 0,
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {name}
                            {m.userId === currentUserId && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> (you)</span>}
                          </div>
                          {m.role === "ADMIN" && (
                            <div style={{ fontSize: 10, color: "var(--accent-amber)", fontWeight: 700 }}>Admin</div>
                          )}
                        </div>
                      </div>
                      {balance && (
                        <span
                          style={{
                            fontSize: 12, fontWeight: 700,
                            color: balance.balance > 0.01 ? "var(--accent-green)"
                              : balance.balance < -0.01 ? "var(--accent-red)"
                                : "var(--text-muted)",
                          }}
                        >
                          {balance.balance > 0.01 ? `+${formatCurrency(balance.balance)}`
                            : balance.balance < -0.01 ? formatCurrency(balance.balance)
                              : "Settled"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddGroupExpenseDialog
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        onSuccess={fetchGroup}
        groupId={id}
        members={group.members}
        currentUserId={currentUserId}
      />

      <AddTransactionDialog
        isOpen={txnDialogOpen}
        onClose={() => setTxnDialogOpen(false)}
        onSuccess={() => {}}
      />

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .group-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  );
}
