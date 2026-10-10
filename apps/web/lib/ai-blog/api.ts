import "server-only";
import { StatusCodes } from "http-status-codes";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { RunError } from "./pipeline";

type AuthedUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function handleAiBlogRequest<T>(
  request: Request,
  message: string,
  work: (user: AuthedUser) => Promise<T>,
) {
  if (!isSameOrigin(request)) {
    return apiError("Cross-origin request blocked", { status: StatusCodes.FORBIDDEN, code: "forbidden" });
  }

  const user = await getCurrentUser();
  if (!user || !user.role) {
    return apiError("Unauthorized", { status: StatusCodes.UNAUTHORIZED, code: "unauthorized" });
  }

  try {
    return apiSuccess(await work(user), message);
  } catch (error) {
    if (error instanceof RunError) {
      return apiError(error.message, { status: error.status, code: "run_error" });
    }
    console.error(JSON.stringify({ scope: "ai-blog", event: "route.error", error: String(error) }));
    return apiError("Unexpected server error", { status: StatusCodes.INTERNAL_SERVER_ERROR, code: "internal" });
  }
}

export function toItemDto(item: {
  id: string;
  position: number;
  topic: string;
  angle: string;
  status: string;
  failedStage: string | null;
  error: string | null;
  postId: string | null;
  warnings: string[];
}) {
  return {
    id: item.id,
    position: item.position,
    topic: item.topic,
    angle: item.angle,
    status: item.status,
    failedStage: item.failedStage,
    error: item.error,
    postId: item.postId,
    warnings: item.warnings,
  };
}
