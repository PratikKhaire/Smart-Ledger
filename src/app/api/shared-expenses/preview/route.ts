import { NextRequest } from "next/server";
import { splitPreviewSchema } from "@/schemas/shared-expense";
import { getPreview } from "@/services/split-service";
import { handleApiError, ValidationError } from "@/lib/errors";

/**
 * POST /api/shared-expenses/preview — Preview split calculation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = splitPreviewSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      }
      throw new ValidationError("Invalid split preview data", fieldErrors);
    }

    const preview = getPreview(parsed.data);
    return Response.json({ data: preview });
  } catch (error) {
    return handleApiError(error);
  }
}
