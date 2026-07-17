import { getAnalyticsSummary } from "@/services/analytics-service";
import { handleApiError } from "@/lib/errors";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/summary — Full analytics dashboard data
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getAnalyticsSummary(user.userId);
    console.log("API sending summary:", JSON.stringify(summary).substring(0, 200) + "...");
    return Response.json({ data: summary });
  } catch (error) {
    return handleApiError(error);
  }
}
