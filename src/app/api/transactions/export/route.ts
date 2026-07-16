import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.userId },
      orderBy: { date: "desc" },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ error: "No transactions found to export" }, { status: 400 });
    }

    // Generate CSV Header
    const headers = ["ID", "Date", "Type", "Category", "Amount", "Note", "Is Shared"];
    
    // Generate CSV Rows
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toISOString().split("T")[0], // YYYY-MM-DD
      t.type,
      t.category,
      t.amount.toString(),
      `"${(t.note || "").replace(/"/g, '""')}"`, // Escape quotes
      t.isShared ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 });
  }
}
