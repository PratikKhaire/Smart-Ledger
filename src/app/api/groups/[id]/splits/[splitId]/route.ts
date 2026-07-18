import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

/**
 * PATCH /api/groups/[id]/splits/[splitId] — mark a split as paid/unpaid
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; splitId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: groupId, splitId } = await params;

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.userId } },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const body = await req.json();
    const isPaid: boolean = Boolean(body.isPaid);

    const split = await prisma.groupSplit.update({
      where: { id: splitId },
      data: {
        isPaid,
        paidAt: isPaid ? new Date() : null,
      },
    });

    return NextResponse.json({ data: split });
  } catch (error) {
    return handleApiError(error);
  }
}
