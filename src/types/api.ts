/**
 * Standard API response wrappers
 */

export interface ApiResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

/**
 * Analytics types
 */
export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface SmartInsight {
  type: "top_category" | "spending_spike" | "saving_streak" | "low_data";
  title: string;
  description: string;
  value?: string;
  trend?: "up" | "down" | "neutral";
}

export interface AnalyticsSummary {
  summary: SummaryData;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  insight: SmartInsight;
}
