"use client";

import { useState, useEffect } from "react";
import { CURRENCIES, getSelectedCurrency, setSelectedCurrency, type CurrencyCode } from "@/lib/currency";
import { Database, Trash2, AlertTriangle, Check, Loader2, Globe, Target } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/utils";

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

/* --- Budget Configuration --- */
export function BudgetConfigCard() {
  const [isSaving, setIsSaving] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState("");
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBudgets(data);
      });
  }, [currentMonth, currentYear]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          limitAmount: parseFloat(limitAmount),
          month: currentMonth,
          year: currentYear,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBudgets((prev) => {
          const filtered = prev.filter((b) => b.category !== updated.category);
          return [...filtered, updated].sort((a, b) => a.category.localeCompare(b.category));
        });
        setLimitAmount("");
        alert("Budget saved successfully!");
      }
    } catch {
      alert("Failed to save budget.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Target size={18} color="var(--accent-purple)" />
        <div style={{ fontSize: 15, fontWeight: 600 }}>Monthly Budgets</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        Set spending limits for expense categories for the current month.
      </p>

      <form onSubmit={handleSaveBudget} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select
          className="input"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setLimitAmount("");
          }}
          style={{ width: "200px" }}
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="input"
          placeholder="Amount"
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          min="1"
          step="0.01"
          required
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? <Loader2 size={16} className="auth-spinner" /> : "Save"}
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {budgets.length > 0 && (
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
            Current Limits ({new Date().toLocaleString("default", { month: "long" })})
          </div>
        )}
        {budgets.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "var(--bg-elevated)",
              borderRadius: "8px",
              fontSize: 13,
            }}
          >
            <span style={{ fontWeight: 500 }}>{b.category}</span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {CURRENCIES[getSelectedCurrency()].symbol}{b.limitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Data Export --- */
export function DataExportCard() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create a temporary link to download the file directly from the API route
      const link = document.createElement("a");
      link.href = "/api/transactions/export";
      link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Failed to export data");
    } finally {
      setTimeout(() => setIsExporting(false), 1000); // UI feedback delay
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Database size={18} color="var(--accent-blue)" />
        <div style={{ fontSize: 15, fontWeight: 600 }}>Export Data</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        Download all your transactions as a CSV file for backup or use in Excel.
      </p>
      <button
        className="btn btn-secondary"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <Loader2 size={14} className="auth-spinner" />
            Exporting...
          </>
        ) : (
          <>
            <Database size={14} />
            Export to CSV
          </>
        )}
      </button>
    </div>
  );
}

/* --- Profile Settings --- */
export function ProfileSettingsCard() {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch initial profile data
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name) setName(data.user.name);
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    if (newPassword && !currentPassword) {
      setError("Current password is required to set a new password.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      
      // Reload to reflect name changes in the shell
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Globe size={18} color="var(--accent-purple)" />
        <div style={{ fontSize: 15, fontWeight: 600 }}>Profile Details</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        Update your account name and password.
      </p>

      {error && (
        <div style={{ padding: 12, borderRadius: 8, background: "rgba(244, 63, 94, 0.1)", color: "var(--accent-red)", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: 12, borderRadius: 8, background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-green)", fontSize: 13, marginBottom: 16 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Display Name</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>
        
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Current Password</label>
          <input
            type="password"
            className="input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Required if changing password"
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>New Password</label>
          <input
            type="password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 8 }} disabled={isSaving}>
          {isSaving ? <Loader2 size={14} className="auth-spinner" /> : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
