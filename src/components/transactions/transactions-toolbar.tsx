"use client";

import { Search, Filter } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/utils";

interface TransactionsToolbarProps {
  typeFilter: string;
  categoryFilter: string;
  searchQuery: string;
  onTypeChange: (type: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
}

export default function TransactionsToolbar({
  typeFilter,
  categoryFilter,
  searchQuery,
  onTypeChange,
  onCategoryChange,
  onSearchChange,
}: TransactionsToolbarProps) {
  const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 200px", minWidth: 200 }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          className="input"
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: 36 }}
          aria-label="Search transactions"
        />
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Filter size={14} color="var(--text-muted)" />
        <select
          className="select"
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          style={{ width: "auto", minWidth: 130 }}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {/* Category filter */}
      <select
        className="select"
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{ width: "auto", minWidth: 150 }}
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {allCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
