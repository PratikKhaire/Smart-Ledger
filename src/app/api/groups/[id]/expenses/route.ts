import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";
import { calculateEqualSplit, roundToTwo } from "@/lib/split-calculator";

const addExpenseSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1).max(50),
  date: z.string().optional(),
  splitMethod: z.enum(["EQUAL", "EXACT"]).default("EQUAL"),
  // memberIds: list of member userIds to split between (defaults to all members)
  splits: z.array(z.object({
    userId: z.string(),
    owedAmount: z.number().min(0),
  })).optional(),
});

/**
 * POST /api/groups/[id]/expenses — add a new expense to the group
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: groupId } = await params;

    // Verify membership
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.userId } },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const body = await req.json();
    const parsed = addExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
    }

    const { description, amount, category, splitMethod, splits: providedSplits } = parsed.data;
    const date = parsed.data.date ? new Date(parsed.data.date) : new Date();

    // Get all members to split between (if no explicit splits provided)
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    let splitsData: { userId: string; owedAmount: number }[];

    if (providedSplits && providedSplits.length > 0) {
      splitsData = providedSplits;
    } else {
      // Equal split among all members
      const memberIds = members.map((m) => m.userId);
      const amounts = calculateEqualSplit(amount, memberIds.length);
      splitsData = memberIds.map((uid, i) => ({
        userId: uid,
        owedAmount: roundToTwo(amounts[i]),
      }));
    }

    const expense = await prisma.groupExpense.create({
      data: {
        groupId,
        addedById: user.userId,
        description,
        amount,
        category,
        date,
        splitMethod,
        splits: {
          create: splitsData.map((s) => ({
            userId: s.userId,
            owedAmount: s.owedAmount,
          })),
        },
      },
      include: {
        addedBy: { select: { id: true, name: true, email: true } },
        splits: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/groups/[id]/expenses — list group expenses
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: groupId } = await params;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.userId } },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const expenses = await prisma.groupExpense.findMany({
      where: { groupId },
      include: {
        addedBy: { select: { id: true, name: true, email: true } },
        splits: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: expenses });
  } catch (error) {
    return handleApiError(error);
  }
}
