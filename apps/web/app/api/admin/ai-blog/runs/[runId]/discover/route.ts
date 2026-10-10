import { handleAiBlogRequest, toItemDto } from "@/lib/ai-blog/api";
import { runDiscovery } from "@/lib/ai-blog/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  return handleAiBlogRequest(request, "Topics discovered", async (user) => {
    const items = await runDiscovery(runId, user.id);
    return { items: items.map(toItemDto) };
  });
}
