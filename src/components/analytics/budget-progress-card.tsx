import type { BudgetProgress } from "@/types/api";
import { getSelectedCurrency, CURRENCIES } from "@/lib/currency";
import { Target, AlertCircle } from "lucide-react";

interface BudgetProgressCardProps {
  budgets: BudgetProgress[] | null;
  isLoading: boolean;
}

export default function BudgetProgressCard({ budgets, isLoading }: BudgetProgressCardProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 24, minHeight: 200 }}>
        <div className="skeleton" style={{ width: 150, height: 24, marginBottom: 20 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton" style={{ height: 40, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 40, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return null; // Don't show if no budgets configured
  }

  const currencyCode = getSelectedCurrency();
  const currency = CURRENCIES[currencyCode].symbol;

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Target size={18} color="var(--accent-purple)" />
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Monthly Budgets</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {budgets.map((b) => {
          const isOver = b.percentage >= 100;
          const isWarning = b.percentage >= 85 && !isOver;
          
          let barColor = "var(--accent-blue)";
          if (isOver) barColor = "var(--accent-red)";
          else if (isWarning) barColor = "var(--accent-orange)";

          return (
            <div key={b.category} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{b.category}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {currency}{b.spentAmount.toLocaleString()} / {currency}{b.limitAmount.toLocaleString()}
                </span>
              </div>
              <div style={{ width: "100%", height: 8, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${Math.min(b.percentage, 100)}%`, 
                    background: barColor,
                    borderRadius: 4,
                    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} 
                />
              </div>
              {(isWarning || isOver) && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: isOver ? "var(--accent-red)" : "var(--accent-orange)", fontSize: 12, marginTop: -4 }}>
                  <AlertCircle size={12} />
                  <span>{isOver ? "Over budget!" : "Approaching limit"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
