"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getCategoryColor } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { CategoryBreakdown } from "@/types/api";

interface SpendingByCategoryChartProps {
  data: CategoryBreakdown[];
  isLoading: boolean;
}

export default function SpendingByCategoryChart({
  data,
  isLoading,
}: SpendingByCategoryChartProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 24, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: 70, height: 18, borderRadius: 999 }} />
        </div>
        <div className="skeleton" style={{ width: "100%", height: 280, borderRadius: "var(--radius-md)" }} />
      </div>
    );
  }

  const chartData = (data || []).map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
    color: getCategoryColor(item.category),
  }));

  const hasData = chartData.length > 0;

  return (
    <div
      className="card"
      style={{
        padding: 24,
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
            Spending by Category
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: "6px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent-purple)" }} />
            <span style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1 }}>
              Breakdown
            </span>
          </div>
        </div>

        {!hasData ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            No expense data yet. Add some expenses to see your spending breakdown.
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-primary)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            fontSize: "12px",
                            boxShadow: "var(--shadow-card)",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 2, color: "var(--text-primary)" }}>
                            {item.name}
                          </div>
                          <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                            {formatCurrency(item.value)} ({item.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={7}
                  formatter={(value: string) => (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {hasData && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--border-primary)",
            paddingTop: "14px",
            marginTop: "16px",
            fontSize: "11px",
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          <span>Distribution share</span>
          <span>{chartData.length} categories</span>
        </div>
      )}
    </div>
  );
}
