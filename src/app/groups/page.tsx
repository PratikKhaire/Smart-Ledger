"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import CreateGroupDialog from "@/components/groups/create-group-dialog";
import AddTransactionDialog from "@/components/transactions/add-transaction-dialog";
import { Users, Plus, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  myRole: string;
  _count: { members: number; expenses: number };
  members: { user: { name: string | null; email: string } }[];
  expenses: { amount: number; description: string; createdAt: string }[];
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [txnDialogOpen, setTxnDialogOpen] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (data.data) setGroups(data.data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <AppShell onAddTransaction={() => setTxnDialogOpen(true)}>
      <div>
        {/* Page header */}
        <div className="desktop-only" style={{ flexDirection: "column", gap: 6, marginBottom: 24 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1 }}>
            Groups
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Split expenses with friends, flatmates, and travel buddies.
          </p>
        </div>

        {/* Create group button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={15} />
            New Group
          </button>
        </div>

        {/* Groups grid */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div className="skeleton" style={{ width: 140, height: 18, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "80%", height: 13, marginBottom: 16 }} />
                <div className="skeleton" style={{ width: 80, height: 12 }} />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div
            className="card"
            style={{ padding: "60px 24px", textAlign: "center" }}
          >
            <div
              style={{
                width: 72, height: 72, borderRadius: 18,
                background: "var(--accent-purple-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Users size={32} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No groups yet</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 320, margin: "0 auto 20px" }}>
              Create a group to track shared expenses with friends, family, or colleagues.
            </p>
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus size={15} />
              Create your first group
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {groups.map((group) => {
              const latestExpense = group.expenses?.[0];
              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card"
                    style={{
                      padding: 20, cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-purple)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-primary)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Group icon + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: "var(--accent-purple-dim)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, fontWeight: 800, color: "var(--accent-purple)",
                          flexShrink: 0,
                        }}
                      >
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{group.name}</div>
                        {group.description && (
                          <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {group.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 16, marginBottom: latestExpense ? 14 : 0 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{group._count.members}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>members</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{group._count.expenses}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>expenses</div>
                      </div>
                      {group.myRole === "ADMIN" && (
                        <div style={{ marginLeft: "auto" }}>
                          <span
                            style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 8px",
                              borderRadius: 999, background: "var(--accent-amber-dim)",
                              color: "var(--accent-amber)", textTransform: "uppercase",
                            }}
                          >
                            Admin
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Latest expense */}
                    {latestExpense && (
                      <div
                        style={{
                          padding: "8px 12px",
                          background: "var(--bg-elevated)",
                          borderRadius: 8, fontSize: 12,
                          color: "var(--text-secondary)",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Latest: {latestExpense.description}
                        </span>
                        <ArrowRight size={12} style={{ flexShrink: 0, marginLeft: 8 }} />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CreateGroupDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(group) => {
          setCreateOpen(false);
          router.push(`/groups/${group.id}`);
        }}
      />

      <AddTransactionDialog
        isOpen={txnDialogOpen}
        onClose={() => setTxnDialogOpen(false)}
        onSuccess={() => {}}
      />
    </AppShell>
  );
}
