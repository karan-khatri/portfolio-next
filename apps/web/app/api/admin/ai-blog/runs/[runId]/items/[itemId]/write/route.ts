import { handleAiBlogRequest, toItemDto } from "@/lib/ai-blog/api";
import { runWriting } from "@/lib/ai-blog/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string; itemId: string }> },
) {
  const { runId, itemId } = await params;
  return handleAiBlogRequest(request, "Draft saved", async (user) => {
    const item = await runWriting(runId, itemId, user.id);
    return { item: toItemDto(item) };
  });
}
