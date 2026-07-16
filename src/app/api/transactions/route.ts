import { NextRequest } from "next/server";
import {
  createTransaction,
  getTransactions,
} from "@/services/transaction-service";
import { createTransactionSchema, transactionFilterSchema } from "@/schemas/transaction";
import { handleApiError, ValidationError } from "@/lib/errors";

/**
 * GET /api/transactions — List transactions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = transactionFilterSchema.parse({
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    const transactions = await getTransactions(filters);
    return Response.json({ data: transactions });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/transactions — Create a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      throw new ValidationError("Invalid transaction data", fieldErrors);
    }

    const transaction = await createTransaction(parsed.data);
    return Response.json({ data: transaction }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
