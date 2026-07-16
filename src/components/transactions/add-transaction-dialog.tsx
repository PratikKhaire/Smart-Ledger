"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Plus, Minus, Users, AlertCircle, Loader2, ChevronDown, Search, Check } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryColor } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { calculateEqualSplit, validateExactSplit, roundToTwo } from "@/lib/split-calculator";

const CATEGORY_META: Record<string, { description: string; gradient: string }> = {
  food: { description: "Dining, restaurants, groceries, fast food.", gradient: "linear-gradient(135deg, #f97316, #fdba74)" },
  transport: { description: "Fuel, public transit, taxi, parking.", gradient: "linear-gradient(135deg, #3b82f6, #93c5fd)" },
  shopping: { description: "Clothing, electronics, gifts, books.", gradient: "linear-gradient(135deg, #8b5cf6, #c084fc)" },
  entertainment: { description: "Movies, concerts, gaming, streaming.", gradient: "linear-gradient(135deg, #ec4899, #fbcfe8)" },
  bills: { description: "Subscriptions, phone, internet, utilities.", gradient: "linear-gradient(135deg, #ef4444, #fca5a5)" },
  health: { description: "Doctors, pharmacy, medical, fitness.", gradient: "linear-gradient(135deg, #10b981, #6ee7b7)" },
  education: { description: "Tuition, courses, tutorials, textbooks.", gradient: "linear-gradient(135deg, #06b6d4, #67e8f9)" },
  rent: { description: "Monthly housing rent, lease payment.", gradient: "linear-gradient(135deg, #f43f5e, #fda4af)" },
  utilities: { description: "Electricity, gas, water, waste bills.", gradient: "linear-gradient(135deg, #64748b, #cbd5e1)" },
  groceries: { description: "Supermarket, household items, grocery.", gradient: "linear-gradient(135deg, #fb923c, #fde047)" },
  travel: { description: "Flights, hotel booking, vacations.", gradient: "linear-gradient(135deg, #0ea5e9, #7dd3fc)" },
  salary: { description: "Primary job monthly paycheck, payroll.", gradient: "linear-gradient(135deg, #22c55e, #86efac)" },
  freelance: { description: "Side gigs, contract work, consulting.", gradient: "linear-gradient(135deg, #a3e635, #d9f99d)" },
  investment: { description: "Stocks dividends, interest payouts.", gradient: "linear-gradient(135deg, #eab308, #fef08a)" },
  other: { description: "Miscellaneous transaction records.", gradient: "linear-gradient(135deg, #94a3b8, #cbd5e1)" },
};

function getCategoryMeta(category: string) {
  const key = category.toLowerCase();
  return CATEGORY_META[key] || CATEGORY_META.other;
}

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

  // Dropdown states
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            <label className="label">Category</label>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: errors.category ? "1px solid var(--accent-red)" : "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-sm)",
                  color: category ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "14px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all var(--transition-fast)",
                  outline: "none",
                }}
              >
                {category ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "6px",
                        background: getCategoryMeta(category).gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        fontWeight: 800,
                        color: "white",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      {category.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{category}</span>
                  </div>
                ) : (
                  "Select a category"
                )}
                <ChevronDown size={16} style={{ color: "var(--text-secondary)" }} />
              </button>

              {dropdownOpen && (
                <div
                  className="animate-slide-up"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 8,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "16px",
                    boxShadow: "var(--shadow-elevated)",
                    zIndex: 100,
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Search Input Box */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "10px",
                      padding: "8px 12px",
                    }}
                  >
                    <Search size={15} style={{ color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                    {searchQuery && (
                      <X
                        size={14}
                        style={{ color: "var(--text-muted)", cursor: "pointer" }}
                        onClick={() => setSearchQuery("")}
                      />
                    )}
                  </div>

                  {/* Header Row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "var(--text-muted)",
                      padding: "0 4px",
                    }}
                  >
                    <span>Categories</span>
                    {searchQuery && (
                      <span
                        style={{ color: "var(--accent-purple)", cursor: "pointer", textTransform: "none" }}
                        onClick={() => setSearchQuery("")}
                      >
                        Reset
                      </span>
                    )}
                  </div>

                  {/* Categories Scrollable Area */}
                  <div
                    style={{
                      maxHeight: "180px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {categories
                      .filter((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((cat) => {
                        const isSelected = category === cat;
                        const meta = getCategoryMeta(cat);
                        return (
                          <div
                            key={cat}
                            onClick={() => {
                              setCategory(cat);
                              setDropdownOpen(false);
                              setSearchQuery("");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all var(--transition-fast)",
                              background: isSelected ? "var(--bg-elevated)" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {/* Colored Gradient Logo Box */}
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  background: meta.gradient,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  color: "white",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                              >
                                {cat.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                                  {cat
                                }</span>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 1 }}>
                                  {meta.description}
                                </span>
                              </div>
                            </div>
                            
                            {/* Checkmark */}
                            {isSelected && (
                              <span style={{ color: "var(--accent-purple)", display: "flex" }}>
                                <Check size={15} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Bottom Quick Select Tags */}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-primary)",
                      paddingTop: "10px",
                      marginTop: "2px",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8, paddingLeft: 4 }}>
                      Quick Select
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(type === "EXPENSE" ? ["Food", "Groceries", "Rent", "Utilities"] : ["Salary", "Freelance", "Investment"]).map((cat) => (
                        <span
                          key={cat}
                          onClick={() => {
                            setCategory(cat);
                            setDropdownOpen(false);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: `${getCategoryColor(cat)}12`,
                            border: `1px solid ${getCategoryColor(cat)}24`,
                            fontSize: "10px",
                            fontWeight: 700,
                            color: getCategoryColor(cat),
                            cursor: "pointer",
                            transition: "transform var(--transition-fast)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.04)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: getCategoryColor(cat) }} />
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
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
