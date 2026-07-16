import { z } from "zod";

/**
 * Transaction type enum values
 */
export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

/**
 * Create transaction schema — shared between client and server
 * Uses Zod 4 unified `error` parameter instead of legacy `required_error`
 */
export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    error: "Transaction type is required",
  }),
  amount: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Amount is required"
          : "Amount must be a number",
    })
    .positive("Amount must be greater than zero")
    .max(999999999.99, "Amount is too large"),
  category: z
    .string({ error: "Category is required" })
    .min(1, "Category is required")
    .max(50, "Category name is too long"),
  date: z
    .string({ error: "Date is required" })
    .min(1, "Date is required"),
  note: z
    .string()
    .max(500, "Note is too long")
    .optional()
    .transform((val) => val?.trim() || undefined),
  isShared: z.boolean().default(false),
  sharedExpense: z
    .object({
      splitMethod: z.enum(["EQUAL", "EXACT"], {
        error: "Split method is required",
      }),
      paidByName: z.string().optional(),
      participants: z
        .array(
          z.object({
            name: z
              .string()
              .min(1, "Participant name is required")
              .max(100, "Name is too long")
              .transform((val) => val.trim()),
            owedAmount: z
              .number()
              .min(0, "Amount cannot be negative"),
          })
        )
        .min(2, "At least two participants are required"),
    })
    .optional(),
}).refine(
  (data) => {
    // Shared expense is only valid for EXPENSE type
    if (data.isShared && data.type !== "EXPENSE") {
      return false;
    }
    return true;
  },
  {
    message: "Shared expenses must be of type expense",
    path: ["isShared"],
  }
).refine(
  (data) => {
    // If shared, must have shared expense data
    if (data.isShared && !data.sharedExpense) {
      return false;
    }
    return true;
  },
  {
    message: "Shared expense details are required",
    path: ["sharedExpense"],
  }
).refine(
  (data) => {
    // Participant names must be unique
    if (data.sharedExpense) {
      const names = data.sharedExpense.participants.map((p) =>
        p.name.toLowerCase()
      );
      return names.length === new Set(names).size;
    }
    return true;
  },
  {
    message: "Participant names must be unique",
    path: ["sharedExpense", "participants"],
  }
).refine(
  (data) => {
    // Exact split totals must match the transaction amount
    if (
      data.sharedExpense?.splitMethod === "EXACT"
    ) {
      const sum = data.sharedExpense.participants.reduce(
        (acc, p) => acc + p.owedAmount,
        0
      );
      const diff = Math.abs(data.amount - sum);
      return diff <= 0.01;
    }
    return true;
  },
  {
    message: "Split amounts must add up to the total expense",
    path: ["sharedExpense", "participants"],
  }
);

/**
 * Update transaction schema (partial)
 */
export const updateTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  amount: z.number().positive("Amount must be greater than zero").optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.string().optional(),
  note: z
    .string()
    .max(500)
    .optional()
    .transform((val) => val?.trim() || undefined),
});

/**
 * Transaction filter schema (for query params)
 */
export const transactionFilterSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
