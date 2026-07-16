import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction-service";
import { updateTransactionSchema } from "@/schemas/transaction";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/transactions/:id — Get a single transaction
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transaction = await getTransactionById(id, user.userId);

    if (!transaction) {
      throw new NotFoundError("Transaction", id);
    }

    return NextResponse.json({ data: transaction });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/transactions/:id — Update a transaction
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getTransactionById(id, user.userId);

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

    const transaction = await updateTransaction(id, user.userId, parsed.data);
    return NextResponse.json({ data: transaction });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/transactions/:id — Delete a transaction
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getTransactionById(id, user.userId);

    if (!existing) {
      throw new NotFoundError("Transaction", id);
    }

    await deleteTransaction(id, user.userId);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return handleApiError(error);
  }
}
