"use client";

import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { SummaryData } from "@/types/api";

interface SummaryCardsProps {
  data: SummaryData | null;
  isLoading: boolean;
}

export default function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 140, height: 32, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 100, height: 12 }} />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Income",
      value: data?.totalIncome ?? 0,
      icon: TrendingUp,
      color: "var(--accent-green)",
      bgColor: "var(--accent-green-dim)",
      shadow: "var(--shadow-glow-green)",
    },
    {
      label: "Total Expenses",
      value: data?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "var(--accent-red)",
      bgColor: "var(--accent-red-dim)",
      shadow: "var(--shadow-glow-red)",
    },
    {
      label: "Net Balance",
      value: data?.netBalance ?? 0,
      icon: Wallet,
      color: (data?.netBalance ?? 0) >= 0 ? "var(--accent-blue)" : "var(--accent-red)",
      bgColor: (data?.netBalance ?? 0) >= 0 ? "var(--accent-blue-dim)" : "var(--accent-red-dim)",
      shadow: (data?.netBalance ?? 0) >= 0 ? "var(--shadow-glow-blue)" : "var(--shadow-glow-red)",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="card"
            style={{
              padding: 24,
              cursor: "default",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = card.shadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-card)";
            }}
          >
            {/* Decorative gradient blob */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: card.bgColor,
                filter: "blur(20px)",
                opacity: 0.6,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                  {card.label}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: card.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={card.color} />
                </div>
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: card.color,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                }}
              >
                {formatCurrency(card.value)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                {data?.transactionCount ?? 0} total transactions
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
