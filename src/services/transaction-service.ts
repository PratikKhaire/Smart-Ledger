import { prisma } from "@/lib/prisma";
import { calculateEqualSplit, roundToTwo } from "@/lib/split-calculator";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilter,
} from "@/schemas/transaction";

/**
 * Transaction service — business logic separated from route handlers
 */

export async function createTransaction(input: CreateTransactionInput) {
  const { sharedExpense, ...transactionData } = input;

  return prisma.transaction.create({
    data: {
      type: transactionData.type,
      amount: transactionData.amount,
      category: transactionData.category,
      date: new Date(transactionData.date),
      note: transactionData.note || null,
      isShared: transactionData.isShared,
      ...(transactionData.isShared && sharedExpense
        ? {
            sharedExpense: {
              create: {
                splitMethod: sharedExpense.splitMethod,
                paidByParticipantId: null,
                participants: {
                  create:
                    sharedExpense.splitMethod === "EQUAL"
                      ? sharedExpense.participants.map((p, i) => ({
                          name: p.name,
                          owedAmount: calculateEqualSplit(
                            transactionData.amount,
                            sharedExpense.participants.length
                          )[i],
                        }))
                      : sharedExpense.participants.map((p) => ({
                          name: p.name,
                          owedAmount: roundToTwo(p.owedAmount),
                        })),
                },
              },
            },
          }
        : {}),
    },
    include: {
      sharedExpense: {
        include: {
          participants: true,
        },
      },
    },
  });
}

export async function getTransactions(filters?: TransactionFilter) {
  const where: Record<string, unknown> = {};

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.search) {
    where.OR = [
      { note: { contains: filters.search } },
      { category: { contains: filters.search } },
    ];
  }

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters?.startDate) {
      (where.date as Record<string, unknown>).gte = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      (where.date as Record<string, unknown>).lte = new Date(filters.endDate);
    }
  }

  return prisma.transaction.findMany({
    where,
    include: {
      sharedExpense: {
        include: {
          participants: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      sharedExpense: {
        include: {
          participants: true,
        },
      },
    },
  });
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
) {
  return prisma.transaction.update({
    where: { id },
    data: {
      ...(input.type && { type: input.type }),
      ...(input.amount && { amount: input.amount }),
      ...(input.category && { category: input.category }),
      ...(input.date && { date: new Date(input.date) }),
      ...(input.note !== undefined && { note: input.note || null }),
    },
    include: {
      sharedExpense: {
        include: {
          participants: true,
        },
      },
    },
  });
}

export async function deleteTransaction(id: string) {
  return prisma.transaction.delete({
    where: { id },
  });
}

export async function getCategories() {
  const categories = await prisma.transaction.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return categories.map((c) => c.category);
}
