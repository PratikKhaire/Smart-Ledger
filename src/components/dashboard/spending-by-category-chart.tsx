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
      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: 180, height: 16, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: "100%", height: 250, borderRadius: "var(--radius-md)" }} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          Spending by Category
        </div>
        <div
          style={{
            padding: "40px 20px",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          No expense data yet. Add some expenses to see your spending breakdown.
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
    color: getCategoryColor(item.category),
  }));

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
        Spending by Category
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
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
                      borderRadius: "var(--radius-sm)",
                      padding: "8px 12px",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {item.name}
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>
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
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
