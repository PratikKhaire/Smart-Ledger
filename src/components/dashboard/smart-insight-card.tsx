"use client";

import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import type { SmartInsight } from "@/types/api";

interface SmartInsightCardProps {
  insight: SmartInsight | null;
  isLoading: boolean;
}

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

export default function SmartInsightCard({ insight, isLoading }: SmartInsightCardProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 24, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
          <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 999 }} />
        </div>
        <div className="skeleton" style={{ width: "80%", height: 18, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "95%", height: 14, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: "50%", height: 14 }} />
      </div>
    );
  }

  if (!insight) return null;

  const trendIcon = {
    up: <TrendingUp size={12} />,
    down: <TrendingDown size={12} />,
    neutral: <Minus size={12} />,
  };

  const trendColor = {
    up: "var(--accent-red)",
    down: "var(--accent-green)",
    neutral: "var(--accent-blue)",
  };

  const trendText = {
    up: "Upward trend",
    down: "Savings improvement",
    neutral: "Neutral trend",
  };

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
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div>
        {/* Top Row: Icon + Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lightbulb size={16} color="var(--accent-amber)" strokeWidth={2.5} />
          </div>

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
            <SignalIcon level="medium" color="#f59e0b" />
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                lineHeight: 1,
              }}
            >
              Smart Insight
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            marginBottom: 6,
            letterSpacing: "-0.2px",
          }}
        >
          {insight.title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "12.5px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {insight.description}
        </div>
      </div>

      {/* Bottom Row: Insight Tags */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border-primary)",
          paddingTop: "14px",
          marginTop: "20px",
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          <span
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
                background: "var(--accent-purple)",
              }}
            />
            AI Analysis
          </span>
          {insight.value && insight.trend && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: "6px",
                background: `${trendColor[insight.trend]}12`,
                border: `1px solid ${trendColor[insight.trend]}24`,
                fontSize: "10px",
                fontWeight: 600,
                color: trendColor[insight.trend],
              }}
            >
              {trendIcon[insight.trend]}
              {insight.value}
            </span>
          )}
        </div>

        <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>
          Active
        </div>
      </div>
    </div>
  );
}
