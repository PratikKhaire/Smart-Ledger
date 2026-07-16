"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import type { MonthlyTrend } from "@/types/api";

interface ExpenseTrendChartProps {
  data: MonthlyTrend[];
  isLoading: boolean;
}

export default function ExpenseTrendChart({
  data,
  isLoading,
}: ExpenseTrendChartProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: 200, height: 16, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: "100%", height: 300, borderRadius: "var(--radius-md)" }} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          Income vs Expenses Trend
        </div>
        <div style={{ padding: "40px 20px", color: "var(--text-muted)", fontSize: 14 }}>
          Need more data to show trends. Keep tracking your transactions!
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
        Income vs Expenses (Last 6 Months)
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-primary)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--border-primary)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}K` : `${value}`
            }
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 14px",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      {label}
                    </div>
                    {payload.map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 2,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: entry.color,
                          }}
                        />
                        <span style={{ color: "var(--text-secondary)" }}>
                          {entry.name}:
                        </span>
                        <span style={{ fontWeight: 600 }}>
                          {formatCurrency(entry.value as number)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="rect"
            iconSize={10}
            formatter={(value: string) => (
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="var(--accent-green)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="var(--accent-red)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
