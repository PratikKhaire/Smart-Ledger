import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.userId,
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Failed to fetch budgets:", error);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, limitAmount, month, year } = body;

    if (!category || limitAmount === undefined || !month || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert budget
    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId: user.userId,
          category,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      update: {
        limitAmount: parseFloat(limitAmount),
      },
      create: {
        userId: user.userId,
        category,
        limitAmount: parseFloat(limitAmount),
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Failed to save budget:", error);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}
