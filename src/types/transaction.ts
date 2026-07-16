/**
 * Transaction types derived from Prisma + Zod schemas
 */

export type TransactionType = "INCOME" | "EXPENSE";
export type SplitMethod = "EQUAL" | "EXACT";

export interface Participant {
  id: string;
  name: string;
  owedAmount: number;
  sharedExpenseId: string;
}

export interface SharedExpense {
  id: string;
  transactionId: string;
  paidByParticipantId: string | null;
  splitMethod: SplitMethod;
  participants: Participant[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionWithSharedExpense extends Transaction {
  sharedExpense: SharedExpense | null;
}
