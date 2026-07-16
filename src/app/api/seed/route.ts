import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { subDays, subMonths } from "date-fns";

/**
 * POST /api/seed — Seed demo data
 */
export async function POST() {
  try {
    // Clear existing data first
    await prisma.participant.deleteMany();
    await prisma.sharedExpense.deleteMany();
    await prisma.transaction.deleteMany();

    const now = new Date();

    const transactions = [
      { type: "INCOME", amount: 85000, category: "Salary", date: subDays(now, 1), note: "July salary credited" },
      { type: "EXPENSE", amount: 2500, category: "Food", date: subDays(now, 1), note: "Dinner at Taj restaurant" },
      { type: "EXPENSE", amount: 450, category: "Transport", date: subDays(now, 2), note: "Uber to office" },
      { type: "EXPENSE", amount: 15000, category: "Rent", date: subDays(now, 3), note: "Monthly rent payment" },
      { type: "EXPENSE", amount: 1200, category: "Entertainment", date: subDays(now, 4), note: "Movie tickets + popcorn" },
      { type: "EXPENSE", amount: 3500, category: "Shopping", date: subDays(now, 5), note: "New headphones from Amazon" },
      { type: "EXPENSE", amount: 800, category: "Health", date: subDays(now, 6), note: "Monthly gym membership" },
      { type: "INCOME", amount: 12000, category: "Freelance", date: subDays(now, 7), note: "Website design project" },
      { type: "EXPENSE", amount: 2200, category: "Groceries", date: subDays(now, 8), note: "Weekly groceries" },
      { type: "EXPENSE", amount: 1800, category: "Bills", date: subDays(now, 9), note: "Electricity bill" },
      { type: "INCOME", amount: 85000, category: "Salary", date: subMonths(now, 1), note: "June salary" },
      { type: "EXPENSE", amount: 15000, category: "Rent", date: subDays(subMonths(now, 1), 2), note: "Monthly rent" },
      { type: "EXPENSE", amount: 8500, category: "Travel", date: subDays(subMonths(now, 1), 5), note: "Weekend trip to Goa" },
      { type: "EXPENSE", amount: 3200, category: "Food", date: subDays(subMonths(now, 1), 8), note: "Birthday dinner" },
      { type: "EXPENSE", amount: 1500, category: "Education", date: subDays(subMonths(now, 1), 10), note: "Udemy course" },
      { type: "INCOME", amount: 5000, category: "Investment", date: subDays(subMonths(now, 1), 12), note: "Mutual fund dividend" },
      { type: "EXPENSE", amount: 4500, category: "Shopping", date: subDays(subMonths(now, 1), 15), note: "Clothes from Myntra" },
      { type: "INCOME", amount: 82000, category: "Salary", date: subMonths(now, 2), note: "May salary" },
      { type: "EXPENSE", amount: 15000, category: "Rent", date: subDays(subMonths(now, 2), 3), note: "Monthly rent" },
      { type: "EXPENSE", amount: 2800, category: "Food", date: subDays(subMonths(now, 2), 7), note: "Lunch with colleagues" },
      { type: "EXPENSE", amount: 6000, category: "Health", date: subDays(subMonths(now, 2), 10), note: "Doctor + medicines" },
      { type: "EXPENSE", amount: 950, category: "Utilities", date: subDays(subMonths(now, 2), 14), note: "Internet bill" },
    ];

    for (const txn of transactions) {
      await prisma.transaction.create({
        data: {
          type: txn.type,
          amount: txn.amount,
          category: txn.category,
          date: txn.date,
          note: txn.note,
          isShared: false,
        },
      });
    }

    // Shared expenses
    await prisma.transaction.create({
      data: {
        type: "EXPENSE", amount: 4800, category: "Food", date: subDays(now, 3),
        note: "Group dinner at Barbeque Nation", isShared: true,
        sharedExpense: {
          create: {
            splitMethod: "EQUAL",
            participants: {
              create: [
                { name: "You", owedAmount: 1200 },
                { name: "Rahul", owedAmount: 1200 },
                { name: "Priya", owedAmount: 1200 },
                { name: "Amit", owedAmount: 1200 },
              ],
            },
          },
        },
      },
    });

    await prisma.transaction.create({
      data: {
        type: "EXPENSE", amount: 6500, category: "Travel", date: subDays(now, 10),
        note: "Lonavala weekend trip", isShared: true,
        sharedExpense: {
          create: {
            splitMethod: "EXACT",
            participants: {
              create: [
                { name: "You", owedAmount: 2500 },
                { name: "Sneha", owedAmount: 2000 },
                { name: "Vikram", owedAmount: 2000 },
              ],
            },
          },
        },
      },
    });

    await prisma.transaction.create({
      data: {
        type: "EXPENSE", amount: 1500, category: "Entertainment", date: subDays(subMonths(now, 1), 4),
        note: "Movie tickets for 3", isShared: true,
        sharedExpense: {
          create: {
            splitMethod: "EQUAL",
            participants: {
              create: [
                { name: "You", owedAmount: 500 },
                { name: "Rahul", owedAmount: 500 },
                { name: "Priya", owedAmount: 500 },
              ],
            },
          },
        },
      },
    });

    return Response.json({ data: { message: "Seed data created successfully", count: 25 } });
  } catch (error) {
    return handleApiError(error);
  }
}
