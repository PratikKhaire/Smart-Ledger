"use client";

import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { SummaryData } from "@/types/api";

interface SummaryCardsProps {
  data: SummaryData | null;
  isLoading: boolean;
}

// Detailing: Signal Strength/Priority Icon matching the screenshot
const SignalIcon = ({ level, color }: { level: "low" | "medium" | "high"; color: string }) => {
  const opacity1 = 1;
  const opacity2 = level === "medium" || level === "high" ? 1 : 0.25;
  const opacity3 = level === "high" ? 1 : 0.25;
  return (
    <div style={{ display: "flex", gap: 2.5, alignItems: "flex-end", height: 9 }}>
      <div style={{ width: 2.5, height: 4, background: color, opacity: opacity1, borderRadius: 0.5 }} />
      <div style={{ width: 2.5, height: 6.5, background: color, opacity: opacity2, borderRadius: 0.5 }} />
      <div style={{ width: 2.5, height: 9, background: color, opacity: opacity3, borderRadius: 0.5 }} />
    </div>
  );
};

export default function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
              <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 999 }} />
            </div>
            <div className="skeleton" style={{ width: "60%", height: 16, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "80%", height: 30, marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
              <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 999 }} />
              <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const netVal = data?.netBalance ?? 0;
  const isHealthy = netVal >= 0;

  const cards = [
    {
      label: "Total Income",
      value: data?.totalIncome ?? 0,
      icon: TrendingUp,
      color: "var(--accent-green)",
      bgColor: "var(--accent-green-dim)",
      badgeText: "High",
      badgeLevel: "high" as const,
      badgeColor: "#10b981",
      tags: ["Salary", "Freelance"],
    },
    {
      label: "Total Expenses",
      value: data?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "var(--accent-red)",
      bgColor: "var(--accent-red-dim)",
      badgeText: (data?.totalExpenses ?? 0) > (data?.totalIncome ?? 0) * 0.7 ? "High" : "Medium",
      badgeLevel: (data?.totalExpenses ?? 0) > (data?.totalIncome ?? 0) * 0.7 ? ("high" as const) : ("medium" as const),
      badgeColor: (data?.totalExpenses ?? 0) > (data?.totalIncome ?? 0) * 0.7 ? "#f43f5e" : "#f59e0b",
      tags: ["Rent", "Groceries"],
    },
    {
      label: "Net Balance",
      value: netVal,
      icon: Wallet,
      color: isHealthy ? "var(--accent-blue)" : "var(--accent-red)",
      bgColor: isHealthy ? "var(--accent-blue-dim)" : "var(--accent-red-dim)",
      badgeText: isHealthy ? "Healthy" : "Low",
      badgeLevel: isHealthy ? ("high" as const) : ("low" as const),
      badgeColor: isHealthy ? "#3b82f6" : "#f43f5e",
      tags: ["Active", "Safe"],
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="card"
            style={{
              padding: "24px",
              cursor: "default",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid var(--border-primary)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Row: Icon + Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              {/* Icon Container */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: card.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} color={card.color} strokeWidth={2.5} />
              </div>

              {/* Priority/Alert Badge exactly like screenshot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <SignalIcon level={card.badgeLevel} color={card.badgeColor} />
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    lineHeight: 1,
                  }}
                >
                  {card.badgeText}
                </span>
              </div>
            </div>

            {/* Middle Row: Content */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: 6,
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.8px",
                  lineHeight: 1.1,
                }}
              >
                {formatCurrency(card.value)}
              </div>
            </div>

            {/* Bottom Row: Tags matching the Figma/Framer labels */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid var(--border-primary)",
                paddingTop: "14px",
                marginTop: "4px",
              }}
            >
              <div style={{ display: "flex", gap: 5 }}>
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-primary)",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: card.color,
                      }}
                    />
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                }}
              >
                {data?.transactionCount ?? 0} Txns
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
