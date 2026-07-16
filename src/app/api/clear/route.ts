import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

/**
 * POST /api/clear — Clear all data
 */
export async function POST() {
  try {
    await prisma.participant.deleteMany();
    await prisma.sharedExpense.deleteMany();
    await prisma.transaction.deleteMany();

    return Response.json({ data: { message: "All data cleared successfully" } });
  } catch (error) {
    return handleApiError(error);
  }
}
