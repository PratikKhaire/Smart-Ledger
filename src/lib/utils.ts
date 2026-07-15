import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

/**
 * Merge Tailwind CSS classes with clsx + tailwind-merge
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display in transaction lists
 * - Today: "Today"
 * - Yesterday: "Yesterday"
 * - This year: "Jul 15"
 * - Older: "Jul 15, 2025"
 */
export function formatTransactionDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  const now = new Date();
  if (d.getFullYear() === now.getFullYear()) {
    return format(d, "MMM d");
  }
  return format(d, "MMM d, yyyy");
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

/**
 * Relative time description (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate a deterministic color from a category name
 * Used for chart segments and category badges
 */
const CATEGORY_COLORS: Record<string, string> = {
  food: "#f97316",
  transport: "#3b82f6",
  shopping: "#8b5cf6",
  entertainment: "#ec4899",
  bills: "#ef4444",
  health: "#10b981",
  education: "#06b6d4",
  salary: "#22c55e",
  freelance: "#a3e635",
  investment: "#eab308",
  rent: "#f43f5e",
  utilities: "#64748b",
  groceries: "#fb923c",
  travel: "#0ea5e9",
  other: "#94a3b8",
};

export function getCategoryColor(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.other;
}

/**
 * Predefined category lists
 */
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Rent",
  "Utilities",
  "Groceries",
  "Travel",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Other",
] as const;
