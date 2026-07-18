import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

/**
 * GET /api/shared/[token]
 * Public endpoint — no auth required.
 * Returns the shared expense details for a given share token.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const sharedExpense = await prisma.sharedExpense.findUnique({
      where: { shareToken: token },
      include: {
        participants: true,
        transaction: {
          select: {
            id: true,
            amount: true,
            category: true,
            date: true,
            note: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!sharedExpense) {
      return NextResponse.json({ error: "Link not found or has been revoked" }, { status: 404 });
    }

    return NextResponse.json({ data: sharedExpense });
  } catch (error) {
    return handleApiError(error);
  }
}
