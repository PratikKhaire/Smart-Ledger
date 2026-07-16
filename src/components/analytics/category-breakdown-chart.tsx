"use client";

import { getCategoryColor } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { CategoryBreakdown } from "@/types/api";

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
  isLoading: boolean;
}

export default function CategoryBreakdownChart({
  data,
  isLoading,
}: CategoryBreakdownChartProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: 180, height: 16, marginBottom: 16 }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "100%", height: 24, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          Category Breakdown
        </div>
        <div style={{ padding: "40px 20px", color: "var(--text-muted)", fontSize: 14 }}>
          No expense data to break down yet.
        </div>
      </div>
    );
  }

  const maxAmount = data[0]?.amount || 1;

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
        Category Breakdown
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.map((item) => {
          const color = getCategoryColor(item.category);
          const widthPercent = (item.amount / maxAmount) * 100;

          return (
            <div key={item.category}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: color,
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {item.category}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      padding: "1px 6px",
                      background: "var(--bg-elevated)",
                      borderRadius: 999,
                    }}
                  >
                    {item.count} txn{item.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {formatCurrency(item.amount)}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  background: "var(--bg-elevated)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${widthPercent}%`,
                    height: "100%",
                    background: color,
                    borderRadius: 4,
                    transition: "width 0.5s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
