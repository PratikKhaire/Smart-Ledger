import { NextRequest } from "next/server";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction-service";
import { updateTransactionSchema } from "@/schemas/transaction";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/transactions/:id — Get a single transaction
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const transaction = await getTransactionById(id);

    if (!transaction) {
      throw new NotFoundError("Transaction", id);
    }

    return Response.json({ data: transaction });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/transactions/:id — Update a transaction
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await getTransactionById(id);

    if (!existing) {
      throw new NotFoundError("Transaction", id);
    }

    const body = await request.json();
    const parsed = updateTransactionSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      throw new ValidationError("Invalid update data", fieldErrors);
    }

    const transaction = await updateTransaction(id, parsed.data);
    return Response.json({ data: transaction });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/transactions/:id — Delete a transaction
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await getTransactionById(id);

    if (!existing) {
      throw new NotFoundError("Transaction", id);
    }

    await deleteTransaction(id);
    return Response.json({ data: { id } });
  } catch (error) {
    return handleApiError(error);
  }
}
