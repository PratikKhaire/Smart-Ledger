import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, comparePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) {
      dataToUpdate.name = name;
    }

    if (newPassword) {
      // Must verify current password
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!dbUser || !currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
      }

      const isValid = await comparePassword(currentPassword, dbUser.password);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
      }

      dataToUpdate.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: dataToUpdate,
      select: { id: true, email: true, name: true }, // Exclude password
    });

    return NextResponse.json({ data: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
