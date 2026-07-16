import { getAnalyticsSummary } from "@/services/analytics-service";
import { handleApiError } from "@/lib/errors";

/**
 * GET /api/analytics/summary — Full analytics dashboard data
 */
export async function GET() {
  try {
    const summary = await getAnalyticsSummary();
    return Response.json({ data: summary });
  } catch (error) {
    return handleApiError(error);
  }
}
