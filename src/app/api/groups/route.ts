import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(80),
  description: z.string().max(300).optional(),
});

/**
 * GET /api/groups — list all groups the current user belongs to
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.userId },
      include: {
        group: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            expenses: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, amount: true, description: true, createdAt: true },
            },
            _count: { select: { expenses: true, members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const groups = memberships.map((m) => ({
      ...m.group,
      myRole: m.role,
    }));

    return NextResponse.json({ data: groups });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/groups — create a new group (creator auto-joins as ADMIN)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        createdById: user.userId,
        members: {
          create: {
            userId: user.userId,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { expenses: true, members: true } },
      },
    });

    return NextResponse.json({ data: group }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
