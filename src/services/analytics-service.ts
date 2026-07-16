import { prisma } from "@/lib/prisma";
import type {
  SummaryData,
  CategoryBreakdown,
  MonthlyTrend,
  SmartInsight,
  AnalyticsSummary,
} from "@/types/api";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

/**
 * Analytics service — computes derived financial data
 */

export async function getSummary(userId: string): Promise<SummaryData> {
  const [incomeResult, expenseResult, countResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "INCOME", userId },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE", userId },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  const totalIncome = incomeResult._sum.amount || 0;
  const totalExpenses = expenseResult._sum.amount || 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionCount: countResult,
  };
}

export async function getCategoryBreakdown(userId: string): Promise<CategoryBreakdown[]> {
  const expenses = await prisma.transaction.groupBy({
    by: ["category"],
    where: { type: "EXPENSE", userId },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
  });

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (e._sum.amount || 0),
    0
  );

  return expenses.map((e) => ({
    category: e.category,
    amount: e._sum.amount || 0,
    percentage:
      totalExpenses > 0
        ? Math.round(((e._sum.amount || 0) / totalExpenses) * 100)
        : 0,
    count: e._count,
  }));
}

export async function getMonthlyTrend(userId: string): Promise<MonthlyTrend[]> {
  const now = new Date();
  const months: MonthlyTrend[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: "INCOME",
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    months.push({
      month: format(monthDate, "MMM yyyy"),
      income: incomeResult._sum.amount || 0,
      expenses: expenseResult._sum.amount || 0,
    });
  }

  return months;
}

export async function getSmartInsight(userId: string): Promise<SmartInsight> {
  const transactionCount = await prisma.transaction.count({ where: { userId } });

  if (transactionCount < 3) {
    return {
      type: "low_data",
      title: "Keep tracking!",
      description:
        "Add more transactions to unlock spending insights. You need at least 3 to get started.",
      trend: "neutral",
    };
  }

  // Find top spending category
  const topCategory = await prisma.transaction.groupBy({
    by: ["category"],
    where: { type: "EXPENSE", userId },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 1,
  });

  if (topCategory.length === 0) {
    return {
      type: "low_data",
      title: "No expenses yet",
      description: "Start tracking expenses to get spending insights.",
      trend: "neutral",
    };
  }

  // Compare current month vs last month
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [currentMonthExpenses, lastMonthExpenses] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        userId,
        date: { gte: currentMonthStart },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        userId,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const currentTotal = currentMonthExpenses._sum.amount || 0;
  const lastTotal = lastMonthExpenses._sum.amount || 0;

  // Check for spending spike
  if (lastTotal > 0 && currentTotal > lastTotal * 1.3) {
    const increase = Math.round(((currentTotal - lastTotal) / lastTotal) * 100);
    return {
      type: "spending_spike",
      title: "Spending spike detected",
      description: `You've spent ${increase}% more this month compared to last month. Your top category is ${topCategory[0].category}.`,
      value: `+${increase}%`,
      trend: "up",
    };
  }

  // Check for saving streak
  if (lastTotal > 0 && currentTotal < lastTotal * 0.8) {
    const decrease = Math.round(((lastTotal - currentTotal) / lastTotal) * 100);
    return {
      type: "saving_streak",
      title: "Great savings!",
      description: `You've spent ${decrease}% less this month compared to last month. Keep it up!`,
      value: `-${decrease}%`,
      trend: "down",
    };
  }

  // Default: top category insight
  return {
    type: "top_category",
    title: `Top spending: ${topCategory[0].category}`,
    description: `${topCategory[0].category} is your biggest expense category. Consider reviewing if this aligns with your budget goals.`,
    value: topCategory[0].category,
    trend: "neutral",
  };
}

export async function getBudgetsProgress(userId: string) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthStart = startOfMonth(now);

  const budgets = await prisma.budget.findMany({
    where: { userId, month: currentMonth, year: currentYear },
  });

  if (budgets.length === 0) return [];

  // Get spent amount for each budgeted category
  const expenses = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      type: "EXPENSE",
      userId,
      date: { gte: monthStart },
      category: { in: budgets.map((b) => b.category) },
    },
    _sum: { amount: true },
  });

  const spentMap = new Map(expenses.map((e) => [e.category, e._sum.amount || 0]));

  return budgets.map((b) => {
    const spentAmount = spentMap.get(b.category) || 0;
    const percentage = Math.min(Math.round((spentAmount / b.limitAmount) * 100), 100);
    return {
      category: b.category,
      limitAmount: b.limitAmount,
      spentAmount,
      percentage,
    };
  });
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const [summary, categoryBreakdown, monthlyTrend, insight, budgets] =
    await Promise.all([
      getSummary(userId),
      getCategoryBreakdown(userId),
      getMonthlyTrend(userId),
      getSmartInsight(userId),
      getBudgetsProgress(userId),
    ]);

  return { summary, categoryBreakdown, monthlyTrend, insight, budgets };
}
