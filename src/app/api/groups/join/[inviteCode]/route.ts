import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

/**
 * POST /api/groups/join/[inviteCode] — join a group by invite code
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { inviteCode } = await params;

    const group = await prisma.group.findUnique({ where: { inviteCode } });
    if (!group) return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });

    // Already a member?
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: user.userId } },
    });
    if (existing) {
      return NextResponse.json({ data: { group, alreadyMember: true } });
    }

    await prisma.groupMember.create({
      data: { groupId: group.id, userId: user.userId, role: "MEMBER" },
    });

    return NextResponse.json({ data: { group, alreadyMember: false } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/groups/join/[inviteCode] — preview group info before joining
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const { inviteCode } = await params;

    const group = await prisma.group.findUnique({
      where: { inviteCode },
      include: {
        _count: { select: { members: true } },
        createdBy: { select: { name: true, email: true } },
      },
    });

    if (!group) return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });

    return NextResponse.json({
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group._count.members,
        createdBy: group.createdBy.name || group.createdBy.email,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
