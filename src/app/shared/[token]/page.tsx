"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Wallet, Users, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatTransactionDate, getCategoryColor } from "@/lib/utils";

interface SharedExpenseData {
  id: string;
  splitMethod: string;
  participants: { id: string; name: string; owedAmount: number }[];
  transaction: {
    id: string;
    amount: number;
    category: string;
    date: string;
    note: string | null;
    user: { name: string | null; email: string } | null;
  };
}

export default function SharedExpensePage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<SharedExpenseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/shared/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) setError(res.error);
        else setData(res.data);
      })
      .catch(() => setError("Failed to load expense details."))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-outer)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480 }}>
        {/* Header branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Wallet size={20} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>Smart Ledger</span>
        </div>

        {isLoading && (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} color="var(--accent-purple)" />
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading shared expense…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <AlertCircle size={40} color="var(--accent-red)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Link Not Found</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>{error}</p>
            <Link href="/" className="btn btn-primary btn-sm">Go to Smart Ledger</Link>
          </div>
        )}

        {!isLoading && data && (
          <div className="card" style={{ padding: 28, overflow: "hidden" }}>
            {/* Category badge */}
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 999,
                background: `${getCategoryColor(data.transaction.category)}18`,
                color: getCategoryColor(data.transaction.category),
                fontSize: 13, fontWeight: 700, marginBottom: 20,
              }}
            >
              {data.transaction.category}
            </div>

            {/* Amount */}
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 4 }}>
              {formatCurrency(data.transaction.amount)}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
              {formatTransactionDate(data.transaction.date)}
              {data.transaction.user && (
                <> · Added by <strong>{data.transaction.user.name || data.transaction.user.email}</strong></>
              )}
            </div>
            {data.transaction.note && (
              <div
                style={{
                  marginTop: 10, padding: "8px 12px",
                  background: "var(--bg-elevated)", borderRadius: 8,
                  fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic",
                }}
              >
                "{data.transaction.note}"
              </div>
            )}

            {/* Split breakdown */}
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12,
                }}
              >
                <Users size={14} />
                {data.splitMethod === "EQUAL" ? "Equal Split" : "Exact Split"} · {data.participants.length} people
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.participants.map((p) => {
                  const share = data.transaction.amount > 0
                    ? Math.round((p.owedAmount / data.transaction.amount) * 100)
                    : 0;
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg-elevated)",
                        borderRadius: 10, border: "1px solid var(--border-primary)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: "var(--accent-purple-dim)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 800, color: "var(--accent-purple)",
                          }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{share}% of total</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-purple)" }}>
                        {formatCurrency(p.owedAmount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: 28, paddingTop: 20,
                borderTop: "1px solid var(--border-primary)",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
                Track your own expenses and group splits for free
              </p>
              <Link href="/signup" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Create free account →
              </Link>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--accent-purple)", fontWeight: 600 }}>Sign in</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
