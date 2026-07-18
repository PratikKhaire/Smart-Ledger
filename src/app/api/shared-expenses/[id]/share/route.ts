import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { randomBytes } from "crypto";

/**
 * POST /api/shared-expenses/[id]/share
 * Generate (or return existing) public share token for a split expense
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Verify this transaction belongs to the requesting user
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: user.userId },
      include: { sharedExpense: true },
    });

    if (!transaction || !transaction.sharedExpense) {
      return NextResponse.json({ error: "Shared expense not found" }, { status: 404 });
    }

    // Return existing token or generate a new one
    let { shareToken } = transaction.sharedExpense;
    if (!shareToken) {
      shareToken = randomBytes(16).toString("hex");
      await prisma.sharedExpense.update({
        where: { id: transaction.sharedExpense.id },
        data: { shareToken },
      });
    }

    return NextResponse.json({ data: { shareToken } });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/shared-expenses/[id]/share
 * Revoke the share token
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: user.userId },
      include: { sharedExpense: true },
    });

    if (!transaction?.sharedExpense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.sharedExpense.update({
      where: { id: transaction.sharedExpense.id },
      data: { shareToken: null },
    });

    return NextResponse.json({ data: { revoked: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
