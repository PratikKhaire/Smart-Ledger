"use client";

import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import type { SmartInsight } from "@/types/api";

interface SmartInsightCardProps {
  insight: SmartInsight | null;
  isLoading: boolean;
}

export default function SmartInsightCard({ insight, isLoading }: SmartInsightCardProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: "100%", height: 16, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: "80%", height: 14 }} />
      </div>
    );
  }

  if (!insight) return null;

  const trendIcon = {
    up: <TrendingUp size={16} />,
    down: <TrendingDown size={16} />,
    neutral: <Minus size={16} />,
  };

  const trendColor = {
    up: "var(--accent-red)",
    down: "var(--accent-green)",
    neutral: "var(--accent-blue)",
  };

  return (
    <div
      className="card"
      style={{
        padding: 20,
        background: "linear-gradient(135deg, var(--bg-card) 0%, var(--accent-purple-dim) 100%)",
        border: "1px solid var(--accent-purple-dim)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "var(--accent-purple-dim)",
          filter: "blur(30px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Lightbulb size={16} color="var(--accent-amber)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-amber)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Smart Insight
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
          {insight.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {insight.description}
        </div>
        {insight.value && insight.trend && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              color: trendColor[insight.trend],
              background: `${trendColor[insight.trend]}15`,
            }}
          >
            {trendIcon[insight.trend]}
            {insight.value}
          </div>
        )}
      </div>
    </div>
  );
}
