import { handleAiBlogRequest } from "@/lib/ai-blog/api";
import { finishRun, totalUsage } from "@/lib/ai-blog/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  return handleAiBlogRequest(request, "Run finished", async (user) => {
    const run = await finishRun(runId, user.id);
    const items = "items" in run ? run.items : [];
    return {
      status: run.status,
      error: run.error,
      savedCount: items.filter((item) => item.status === "SAVED").length,
      usage: totalUsage(run.discoveryUsage, items),
    };
  });
}
