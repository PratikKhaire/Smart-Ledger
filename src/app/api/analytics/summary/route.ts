import { getAnalyticsSummary } from "@/services/analytics-service";
import { handleApiError } from "@/lib/errors";

import { getCurrentUser } from "@/lib/auth";

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
    return Response.json({ data: summary });
  } catch (error) {
    return handleApiError(error);
  }
}
