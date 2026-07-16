"use client";

import { useState } from "react";
import { CURRENCIES, getSelectedCurrency, setSelectedCurrency, type CurrencyCode } from "@/lib/currency";
import { Database, Trash2, AlertTriangle, Check, Loader2, Globe } from "lucide-react";

/* --- Currency Selector --- */
export function CurrencySelector() {
  const [selected, setSelected] = useState<CurrencyCode>(getSelectedCurrency());

  const handleChange = (code: CurrencyCode) => {
    setSelected(code);
    setSelectedCurrency(code);
    // Reload to reflect currency change everywhere
    window.location.reload();
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Globe size={18} color="var(--accent-blue)" />
        <div style={{ fontSize: 15, fontWeight: 600 }}>Currency</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        Choose your preferred currency for displaying amounts.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {Object.values(CURRENCIES).map((currency) => (
          <button
            key={currency.code}
            onClick={() => handleChange(currency.code)}
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${selected === currency.code ? "var(--accent-blue)" : "var(--border-primary)"}`,
              background: selected === currency.code ? "var(--accent-blue-dim)" : "var(--bg-input)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all var(--transition-fast)",
              fontFamily: "inherit",
              color: "var(--text-primary)",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{currency.symbol}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{currency.name}</div>
            {selected === currency.code && (
              <Check size={14} color="var(--accent-blue)" style={{ position: "absolute", top: 8, right: 8 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Seed Demo Data --- */
export function SeedDemoDataCard() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    if (!confirm("This will add demo transactions to your ledger. Continue?")) return;
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setSeeded(true);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch {
      alert("Failed to seed data");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Database size={18} color="var(--accent-cyan)" />
        <div style={{ fontSize: 15, fontWeight: 600 }}>Demo Data</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        Populate the app with sample transactions for testing and reviewing.
        This will add 25 realistic transactions including shared expenses.
      </p>
      <button
        className="btn btn-secondary"
        onClick={handleSeed}
        disabled={isSeeding || seeded}
      >
        {seeded ? (
          <>
            <Check size={14} />
            Data Seeded!
          </>
        ) : isSeeding ? (
          <>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            Seeding...
          </>
        ) : (
          <>
            <Database size={14} />
            Seed Demo Data
          </>
        )}
      </button>
    </div>
  );
}

/* --- Danger Zone --- */
export function DangerZoneCard() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    const confirmed = prompt(
      'This will permanently delete ALL transactions. Type "DELETE" to confirm:'
    );
    if (confirmed !== "DELETE") return;

    setIsClearing(true);
    try {
      const res = await fetch("/api/clear", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      alert("Failed to clear data");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: 24,
        border: "1px solid var(--accent-red-dim)",
        background: "linear-gradient(135deg, var(--bg-card) 0%, var(--accent-red-dim) 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <AlertTriangle size={18} color="var(--accent-red)" />
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--accent-red)" }}>
          Danger Zone
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        Permanently delete all transactions and shared expenses. This action cannot be undone.
      </p>
      <button
        className="btn btn-danger"
        onClick={handleClear}
        disabled={isClearing}
      >
        {isClearing ? (
          <>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            Clearing...
          </>
        ) : (
          <>
            <Trash2 size={14} />
            Clear All Data
          </>
        )}
      </button>
    </div>
  );
}
