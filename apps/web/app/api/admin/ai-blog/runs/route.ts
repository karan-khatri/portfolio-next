import { StatusCodes } from "http-status-codes";
import { apiError } from "@/lib/api/response";
import { handleAiBlogRequest } from "@/lib/ai-blog/api";
import { isLlmConfigured } from "@/lib/ai-blog/config";
import { clampCount, RunError, sanitizeFocus, startRun } from "@/lib/ai-blog/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: { count?: unknown; focus?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be JSON", { status: StatusCodes.BAD_REQUEST });
  }

  return handleAiBlogRequest(request, "Run started", async (user) => {
    if (!isLlmConfigured()) {
      throw new RunError("EXPLABS_API_KEY is not configured on the server.", StatusCodes.SERVICE_UNAVAILABLE);
    }
    const run = await startRun({
      userId: user.id,
      count: clampCount(body.count),
      focus: sanitizeFocus(body.focus),
    });
    return { runId: run.id, requestedCount: run.requestedCount, focus: run.focusKeyword };
  });
}
