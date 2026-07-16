"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Minus, Users, AlertCircle, Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { calculateEqualSplit, validateExactSplit, roundToTwo } from "@/lib/split-calculator";

interface Participant {
  name: string;
  owedAmount: number;
}

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTransactionDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionDialogProps) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [splitMethod, setSplitMethod] = useState<"EQUAL" | "EXACT">("EQUAL");
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "You", owedAmount: 0 },
    { name: "", owedAmount: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setType("EXPENSE");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setIsShared(false);
      setSplitMethod("EQUAL");
      setParticipants([
        { name: "You", owedAmount: 0 },
        { name: "", owedAmount: 0 },
      ]);
      setErrors({});
      setSubmitError("");
    }
  }, [isOpen]);

  // Recalculate equal split when amount or participants change
  useEffect(() => {
    if (splitMethod === "EQUAL" && amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        const splits = calculateEqualSplit(numAmount, participants.length);
        setParticipants((prev) =>
          prev.map((p, i) => ({ ...p, owedAmount: splits[i] ?? 0 }))
        );
      }
    }
  }, [amount, participants.length, splitMethod]);

  const categories = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const addParticipant = () => {
    setParticipants((prev) => [...prev, { name: "", owedAmount: 0 }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 2) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    setParticipants((prev) =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              [field]: field === "owedAmount" ? (value === "" ? 0 : parseFloat(value) || 0) : value,
            }
          : p
      )
    );
  };

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }
    if (!category) {
      newErrors.category = "Category is required";
    }
    if (!date) {
      newErrors.date = "Date is required";
    }

    if (isShared) {
      const emptyNames = participants.filter((p) => !p.name.trim());
      if (emptyNames.length > 0) {
        newErrors.participants = "All participant names are required";
      }

      const names = participants.map((p) => p.name.trim().toLowerCase());
      if (new Set(names).size !== names.length) {
        newErrors.participants = "Participant names must be unique";
      }

      if (splitMethod === "EXACT") {
        const validation = validateExactSplit(
          parseFloat(amount) || 0,
          participants.map((p) => p.owedAmount)
        );
        if (!validation.valid) {
          newErrors.splitTotal = `Split amounts don't add up. Difference: ${formatCurrency(validation.difference)}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, category, date, isShared, participants, splitMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload: Record<string, unknown> = {
        type,
        amount: parseFloat(amount),
        category,
        date,
        note: note.trim() || undefined,
        isShared,
      };

      if (isShared) {
        payload.sharedExpense = {
          splitMethod,
          participants: participants.map((p) => ({
            name: p.name.trim(),
            owedAmount: roundToTwo(p.owedAmount),
          })),
        };
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to create transaction");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const exactTotal = splitMethod === "EXACT"
    ? participants.reduce((sum, p) => sum + p.owedAmount, 0)
    : 0;
  const amountNum = parseFloat(amount) || 0;

  return (
    <>
      {/* Backdrop */}
      <div className="overlay" onClick={onClose} />

      {/* Dialog */}
      <div
        className="animate-slide-up"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(520px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-elevated)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-txn-title"
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <h2 id="add-txn-title" style={{ fontSize: 16, fontWeight: 600 }}>
            Add Transaction
          </h2>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, overflow: "auto", padding: "20px" }}
        >
          {/* Type toggle */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Type</label>
            <div
              style={{
                display: "flex",
                gap: 0,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                border: "1px solid var(--border-primary)",
              }}
            >
              {(["EXPENSE", "INCOME"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategory("");
                    if (t === "INCOME") setIsShared(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    background:
                      type === t
                        ? t === "EXPENSE"
                          ? "var(--accent-red-dim)"
                          : "var(--accent-green-dim)"
                        : "var(--bg-input)",
                    color:
                      type === t
                        ? t === "EXPENSE"
                          ? "var(--accent-red)"
                          : "var(--accent-green)"
                        : "var(--text-muted)",
                    transition: "all var(--transition-fast)",
                    fontFamily: "inherit",
                  }}
                >
                  {t === "EXPENSE" ? "Expense" : "Income"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="amount">Amount</label>
            <input
              id="amount"
              className="input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ fontSize: 18, fontWeight: 600 }}
              aria-describedby={errors.amount ? "amount-error" : undefined}
              autoFocus
            />
            {errors.amount && (
              <div id="amount-error" className="field-error">{errors.amount}</div>
            )}
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="category">Category</label>
            <select
              id="category"
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-describedby={errors.category ? "category-error" : undefined}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <div id="category-error" className="field-error">{errors.category}</div>
            )}
          </div>

          {/* Date */}
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="date">Date</label>
            <input
              id="date"
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-describedby={errors.date ? "date-error" : undefined}
            />
            {errors.date && (
              <div id="date-error" className="field-error">{errors.date}</div>
            )}
          </div>

          {/* Note */}
          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="note">Note (optional)</label>
            <textarea
              id="note"
              className="input"
              rows={2}
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Shared expense toggle — only for expenses */}
          {type === "EXPENSE" && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: isShared ? "var(--accent-purple-dim)" : "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${isShared ? "var(--accent-purple)" : "var(--border-primary)"}`,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onClick={() => setIsShared(!isShared)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Users size={16} color={isShared ? "var(--accent-purple)" : "var(--text-muted)"} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    Split with friends
                  </span>
                </div>
                <div
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    background: isShared ? "var(--accent-purple)" : "var(--border-primary)",
                    position: "relative",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: 3,
                      left: isShared ? 21 : 3,
                      transition: "left var(--transition-fast)",
                    }}
                  />
                </div>
              </div>

              {/* Shared expense section — progressive disclosure */}
              {isShared && (
                <div
                  className="animate-slide-up"
                  style={{
                    marginTop: 16,
                    padding: 16,
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  {/* Split method */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">Split Method</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["EQUAL", "EXACT"] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          className={`btn btn-sm ${splitMethod === method ? "btn-primary" : "btn-secondary"}`}
                          onClick={() => setSplitMethod(method)}
                        >
                          {method === "EQUAL" ? "Equal Split" : "Exact Amounts"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Participants */}
                  <div style={{ marginBottom: 12 }}>
                    <label className="label">Participants</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {participants.map((p, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <input
                            className="input"
                            type="text"
                            placeholder="Name"
                            value={p.name}
                            onChange={(e) => updateParticipant(index, "name", e.target.value)}
                            style={{ flex: 1 }}
                            aria-label={`Participant ${index + 1} name`}
                          />
                          {splitMethod === "EXACT" ? (
                            <input
                              className="input"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={p.owedAmount || ""}
                              onChange={(e) => updateParticipant(index, "owedAmount", e.target.value)}
                              style={{ width: 110 }}
                              aria-label={`Amount for ${p.name || `participant ${index + 1}`}`}
                            />
                          ) : (
                            <div
                              style={{
                                width: 110,
                                padding: "10px 14px",
                                fontSize: 14,
                                fontWeight: 600,
                                color: "var(--accent-purple)",
                                textAlign: "right",
                              }}
                            >
                              {formatCurrency(p.owedAmount)}
                            </div>
                          )}
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            onClick={() => removeParticipant(index)}
                            disabled={participants.length <= 2}
                            aria-label={`Remove ${p.name || "participant"}`}
                            style={{ width: 32, height: 32, flexShrink: 0 }}
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {errors.participants && (
                      <div className="field-error" style={{ marginTop: 6 }}>{errors.participants}</div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addParticipant}
                    style={{ width: "100%", marginBottom: 12 }}
                  >
                    <Plus size={14} />
                    Add Participant
                  </button>

                  {/* Split preview */}
                  {amountNum > 0 && (
                    <div
                      style={{
                        padding: 12,
                        background: "var(--bg-card)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Split Preview
                      </div>
                      {participants.map((p, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "4px 0",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: "var(--text-secondary)" }}>
                            {p.name || `Person ${i + 1}`}
                          </span>
                          <span style={{ fontWeight: 600, color: "var(--accent-purple)" }}>
                            {formatCurrency(p.owedAmount)}
                          </span>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0 0",
                          marginTop: 8,
                          borderTop: "1px solid var(--border-primary)",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        <span>Total</span>
                        <span
                          style={{
                            color:
                              splitMethod === "EXACT" && Math.abs(exactTotal - amountNum) > 0.01
                                ? "var(--accent-red)"
                                : "var(--accent-green)",
                          }}
                        >
                          {formatCurrency(splitMethod === "EXACT" ? exactTotal : amountNum)}
                          {splitMethod === "EXACT" && Math.abs(exactTotal - amountNum) > 0.01 && (
                            <span style={{ fontSize: 11, marginLeft: 4 }}>
                              (need {formatCurrency(amountNum)})
                            </span>
                          )}
                        </span>
                      </div>
                      {errors.splitTotal && (
                        <div className="field-error" style={{ marginTop: 6 }}>
                          <AlertCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                          {errors.splitTotal}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div
              style={{
                padding: "10px 14px",
                background: "var(--accent-red-dim)",
                color: "var(--accent-red)",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={14} />
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: 12, fontSize: 15 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                Saving...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Transaction
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
