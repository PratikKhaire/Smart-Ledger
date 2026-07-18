"use client";

import { useState } from "react";
import { Plus, X, Loader2, AlertCircle, DollarSign } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { calculateEqualSplit } from "@/lib/split-calculator";

interface Member {
  userId: string;
  user: { id: string; name: string | null; email: string };
}

interface AddGroupExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  members: Member[];
  currentUserId: string;
}

export default function AddGroupExpenseDialog({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  members,
  currentUserId,
}: AddGroupExpenseDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [splitMethod, setSplitMethod] = useState<"EQUAL" | "EXACT">("EQUAL");
  const [exactSplits, setExactSplits] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amountNum = parseFloat(amount) || 0;
  const equalShares = amountNum > 0 ? calculateEqualSplit(amountNum, members.length) : [];
  const exactTotal = members.reduce((sum, m) => sum + (parseFloat(exactSplits[m.userId] || "0") || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amountNum <= 0) return;

    if (splitMethod === "EXACT") {
      const diff = Math.abs(exactTotal - amountNum);
      if (diff > 0.01) {
        setError(`Split total (${formatCurrency(exactTotal)}) must equal expense amount (${formatCurrency(amountNum)})`);
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      const splits = splitMethod === "EXACT"
        ? members.map((m) => ({
            userId: m.userId,
            owedAmount: parseFloat(exactSplits[m.userId] || "0") || 0,
          }))
        : undefined; // API will do equal split

      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount: amountNum, category, date, splitMethod, splits }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add expense");

      setDescription(""); setAmount(""); setDate(new Date().toISOString().split("T")[0]);
      setExactSplits({});
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div
        className="animate-slide-up"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(500px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-elevated)",
          zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-expense-title"
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--accent-green-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <DollarSign size={16} color="var(--accent-green)" />
            </div>
            <h2 id="add-expense-title" style={{ fontSize: 16, fontWeight: 700 }}>Add Group Expense</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="exp-desc">Description *</label>
            <input
              id="exp-desc" className="input" type="text"
              placeholder="e.g. Hotel booking, Dinner at Taj"
              value={description} onChange={(e) => setDescription(e.target.value)}
              required autoFocus
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="exp-amt">Total Amount *</label>
            <input
              id="exp-amt" className="input" type="number"
              step="0.01" min="0.01" placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              style={{ fontSize: 18, fontWeight: 600 }}
              required
            />
          </div>

          {/* Category + Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label className="label" htmlFor="exp-cat">Category</label>
              <select id="exp-cat" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="exp-date">Date</label>
              <input id="exp-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Split method */}
          <div style={{ marginBottom: 16 }}>
            <label className="label">Split Method</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["EQUAL", "EXACT"] as const).map((m) => (
                <button
                  key={m} type="button"
                  className={`btn btn-sm ${splitMethod === m ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setSplitMethod(m)}
                >
                  {m === "EQUAL" ? "Equal" : "Custom amounts"}
                </button>
              ))}
            </div>
          </div>

          {/* Members split preview */}
          <div
            style={{
              padding: 14, background: "var(--bg-elevated)",
              borderRadius: 10, border: "1px solid var(--border-primary)",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
              {splitMethod === "EQUAL" ? "Each member pays" : "Enter each member's share"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {members.map((m, i) => {
                const displayName = m.user.name || m.user.email.split("@")[0];
                const isMe = m.userId === currentUserId;
                return (
                  <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: isMe ? "var(--accent-purple-dim)" : "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800,
                        color: isMe ? "var(--accent-purple)" : "var(--text-secondary)",
                        flexShrink: 0,
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
                      {displayName}{isMe && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> (you)</span>}
                    </span>
                    {splitMethod === "EQUAL" ? (
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-purple)" }}>
                        {amountNum > 0 ? formatCurrency(equalShares[i] ?? 0) : "—"}
                      </span>
                    ) : (
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={exactSplits[m.userId] || ""}
                        onChange={(e) => setExactSplits((prev) => ({ ...prev, [m.userId]: e.target.value }))}
                        style={{ width: 110, textAlign: "right" }}
                        aria-label={`Amount for ${displayName}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {splitMethod === "EXACT" && amountNum > 0 && (
              <div
                style={{
                  display: "flex", justifyContent: "space-between",
                  paddingTop: 10, marginTop: 10,
                  borderTop: "1px solid var(--border-primary)",
                  fontSize: 13, fontWeight: 700,
                }}
              >
                <span>Total entered</span>
                <span style={{ color: Math.abs(exactTotal - amountNum) > 0.01 ? "var(--accent-red)" : "var(--accent-green)" }}>
                  {formatCurrency(exactTotal)} / {formatCurrency(amountNum)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 14,
                background: "var(--accent-red-dim)", color: "var(--accent-red)",
                fontSize: 13, display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: 12, fontSize: 14 }}
            disabled={isSubmitting || !description.trim() || amountNum <= 0}
          >
            {isSubmitting
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Adding…</>
              : <><Plus size={15} />Add Expense</>}
          </button>
        </form>
      </div>
    </>
  );
}
