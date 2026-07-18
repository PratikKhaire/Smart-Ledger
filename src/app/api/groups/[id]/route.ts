import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";
import { calculateEqualSplit } from "@/lib/split-calculator";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/groups/[id] — group details, members, expenses + per-member balances
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.userId } },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: "asc" },
        },
        expenses: {
          include: {
            addedBy: { select: { id: true, name: true, email: true } },
            splits: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    // Compute net balance per member (positive = owed to them, negative = they owe)
    const balances: Record<string, number> = {};
    for (const member of group.members) {
      balances[member.userId] = 0;
    }

    for (const expense of group.expenses) {
      const paidById = expense.addedById;
      for (const split of expense.splits) {
        if (split.userId !== paidById) {
          // split.user owes paidBy
          balances[paidById] = (balances[paidById] ?? 0) + split.owedAmount;
          balances[split.userId] = (balances[split.userId] ?? 0) - split.owedAmount;
        }
      }
    }

    const balanceSummary = group.members.map((m) => ({
      userId: m.userId,
      name: m.user.name || m.user.email,
      balance: Math.round((balances[m.userId] ?? 0) * 100) / 100,
    }));

    return NextResponse.json({
      data: { ...group, balanceSummary, myRole: membership.role },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/groups/[id] — delete group (ADMIN only)
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.userId } },
    });
    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can delete groups" }, { status: 403 });
    }

    await prisma.group.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
