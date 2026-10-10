import "server-only";
import { prisma, type Prisma } from "@portfolio/db/server";
import { LIMITS } from "./config";
import type { KnownContent } from "./dedupe";
import { addUsage, ZERO_USAGE, type LlmUsage } from "./llm";
import { saveGeneratedPostAsDraft } from "./save-post";
import { validateBrief, type ResearchBrief, type Topic } from "./schemas";
import { discoverTopics, researchTopic, writePost } from "./stages";

export class RunError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RunError";
    this.status = status;
  }
}

type Stage = "discovery" | "research" | "writing";

function log(event: string, details: Record<string, unknown>) {
  console.log(JSON.stringify({ scope: "ai-blog", event, ...details }));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function sanitizeFocus(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/[^\p{L}\p{N}\s.+#/&-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LIMITS.maxFocusLength);
  return cleaned || null;
}

export function clampCount(raw: unknown): number {
  const value = Math.trunc(Number(raw));
  if (!Number.isFinite(value)) return LIMITS.defaultPosts;
  return Math.min(Math.max(value, 1), LIMITS.maxPosts);
}

export async function startRun(params: { userId: string; count: number; focus: string | null }) {
  const staleBefore = new Date(Date.now() - LIMITS.staleRunMs);
  await prisma.aiBlogRun.updateMany({
    where: { status: "RUNNING", heartbeatAt: { lt: staleBefore } },
    data: { status: "FAILED", error: "Run stopped responding and was closed automatically.", finishedAt: new Date() },
  });

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.aiBlogRun.count({
    where: { createdById: params.userId, createdAt: { gte: hourAgo } },
  });
  if (recent >= LIMITS.maxRunsPerHour) {
    throw new RunError(
      `Rate limit reached: at most ${LIMITS.maxRunsPerHour} generation runs per hour. Try again later.`,
      429,
    );
  }

  try {
    const run = await prisma.aiBlogRun.create({
      data: { requestedCount: params.count, focusKeyword: params.focus, createdById: params.userId },
    });
    log("run.started", { runId: run.id, count: params.count, focus: params.focus });
    return run;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new RunError("A generation run is already in progress. Wait for it to finish.", 409);
    }
    throw error;
  }
}

async function loadActiveRun(runId: string, userId: string) {
  const run = await prisma.aiBlogRun.findUnique({ where: { id: runId } });
  if (!run) throw new RunError("Run not found", 404);
  if (run.createdById !== userId) throw new RunError("This run belongs to another user", 403);
  if (run.status !== "RUNNING") throw new RunError("This run has already finished", 409);
  await prisma.aiBlogRun.update({ where: { id: runId }, data: { heartbeatAt: new Date() } });
  return run;
}

async function loadKnownContent(): Promise<KnownContent[]> {
  const [posts, items] = await Promise.all([
    prisma.post.findMany({ select: { title: true, slug: true }, orderBy: { updatedAt: "desc" }, take: 500 }),
    prisma.aiBlogRunItem.findMany({
      where: { status: { not: "FAILED" } },
      select: { topic: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);
  return [...posts, ...items.map((item) => ({ title: item.topic }))];
}

async function failRun(runId: string, message: string) {
  await prisma.aiBlogRun.updateMany({
    where: { id: runId, status: "RUNNING" },
    data: { status: "FAILED", error: message.slice(0, 1000), finishedAt: new Date() },
  });
}

function usageField(value: Prisma.JsonValue | null | undefined): Partial<Record<Stage, LlmUsage>> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Partial<Record<Stage, LlmUsage>>)
    : {};
}

export async function runDiscovery(runId: string, userId: string) {
  const run = await loadActiveRun(runId, userId);

  const claimed = await prisma.aiBlogRun.updateMany({
    where: { id: runId, discoveredAt: null },
    data: { discoveredAt: new Date() },
  });
  if (claimed.count === 0) throw new RunError("Topic discovery already started for this run", 409);

  try {
    const known = await loadKnownContent();
    const outcome = await discoverTopics({ count: run.requestedCount, focus: run.focusKeyword, known });

    await prisma.$transaction([
      prisma.aiBlogRun.update({
        where: { id: runId },
        data: { discoveryUsage: outcome.usage as unknown as Prisma.InputJsonValue },
      }),
      prisma.aiBlogRunItem.createMany({
        data: outcome.topics.map((topic, position) => ({
          runId,
          position,
          topic: topic.topic,
          angle: topic.angle,
          whyTrending: topic.why_trending,
          sourceUrls: topic.source_urls,
        })),
      }),
    ]);

    log("stage.discovery.ok", {
      runId,
      topics: outcome.topics.length,
      tokens: outcome.usage.totalTokens,
      sources: outcome.reports.map((report) => ({ id: report.id, ok: report.ok, count: report.count, error: report.error })),
      droppedDuplicates: outcome.droppedDuplicates.length,
    });

    return prisma.aiBlogRunItem.findMany({ where: { runId }, orderBy: { position: "asc" } });
  } catch (error) {
    const message = `Topic discovery failed: ${errorMessage(error)}`;
    log("stage.discovery.error", { runId, error: message });
    await failRun(runId, message);
    throw new RunError(message, 502);
  }
}

async function loadItem(runId: string, itemId: string) {
  const item = await prisma.aiBlogRunItem.findFirst({ where: { id: itemId, runId } });
  if (!item) throw new RunError("Item not found", 404);
  return item;
}

function toTopic(item: { topic: string; angle: string; whyTrending: string; sourceUrls: string[] }): Topic {
  return {
    topic: item.topic,
    angle: item.angle,
    why_trending: item.whyTrending,
    source_urls: item.sourceUrls,
  };
}

async function failItem(itemId: string, stage: Stage, message: string, usage?: LlmUsage) {
  const existing = await prisma.aiBlogRunItem.findUnique({ where: { id: itemId }, select: { usage: true } });
  const merged = usage ? { ...usageField(existing?.usage), [stage]: usage } : usageField(existing?.usage);
  await prisma.aiBlogRunItem.update({
    where: { id: itemId },
    data: {
      status: "FAILED",
      failedStage: stage,
      error: message.slice(0, 1000),
      usage: merged as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function runResearch(runId: string, itemId: string, userId: string) {
  await loadActiveRun(runId, userId);
  const item = await loadItem(runId, itemId);

  const claimed = await prisma.aiBlogRunItem.updateMany({
    where: { id: itemId, status: "QUEUED" },
    data: { status: "RESEARCHING" },
  });
  if (claimed.count === 0) throw new RunError("This item is already being processed", 409);

  try {
    const outcome = await researchTopic(toTopic(item));
    const updated = await prisma.aiBlogRunItem.update({
      where: { id: itemId },
      data: {
        research: outcome.brief as unknown as Prisma.InputJsonValue,
        usage: { ...usageField(item.usage), research: outcome.usage } as unknown as Prisma.InputJsonValue,
      },
    });
    log("stage.research.ok", {
      runId,
      itemId,
      pagesRead: outcome.pagesRead,
      skipped: outcome.skipped,
      tokens: outcome.usage.totalTokens,
    });
    return updated;
  } catch (error) {
    const message = errorMessage(error);
    log("stage.research.error", { runId, itemId, error: message });
    await failItem(itemId, "research", message);
    throw new RunError(message, 502);
  }
}

export async function runWriting(runId: string, itemId: string, userId: string) {
  await loadActiveRun(runId, userId);
  const item = await loadItem(runId, itemId);

  const parsedBrief = item.research ? validateBrief(item.research) : null;
  if (!parsedBrief?.ok) throw new RunError("This item has not been researched yet", 409);
  const brief: ResearchBrief = parsedBrief.value;

  const claimed = await prisma.aiBlogRunItem.updateMany({
    where: { id: itemId, status: "RESEARCHING" },
    data: { status: "WRITING" },
  });
  if (claimed.count === 0) throw new RunError("This item is already being processed", 409);

  let usage: LlmUsage = ZERO_USAGE;
  try {
    const outcome = await writePost({ topic: toTopic(item), brief });
    usage = outcome.usage;

    const saved = await saveGeneratedPostAsDraft({ post: outcome.post, userId, runId });

    const updated = await prisma.aiBlogRunItem.update({
      where: { id: itemId },
      data: {
        status: "SAVED",
        postId: saved.postId,
        warnings: outcome.warnings,
        usage: { ...usageField(item.usage), writing: outcome.usage } as unknown as Prisma.InputJsonValue,
      },
    });
    log("stage.writing.ok", {
      runId,
      itemId,
      postId: saved.postId,
      repaired: outcome.repaired,
      warnings: outcome.warnings.length,
      tokens: outcome.usage.totalTokens,
    });
    return updated;
  } catch (error) {
    const message = errorMessage(error);
    log("stage.writing.error", { runId, itemId, error: message, tokens: usage.totalTokens });
    await failItem(itemId, "writing", message, usage.totalTokens > 0 ? usage : undefined);
    throw new RunError(message, 502);
  }
}

export function totalUsage(
  discovery: Prisma.JsonValue | null | undefined,
  items: { usage: Prisma.JsonValue | null }[],
): LlmUsage {
  const isUsage = (value: unknown): value is LlmUsage =>
    typeof value === "object" && value !== null && "totalTokens" in value;

  let total = isUsage(discovery) ? discovery : ZERO_USAGE;
  for (const item of items) {
    for (const value of Object.values(usageField(item.usage))) {
      if (isUsage(value)) total = addUsage(total, value);
    }
  }
  return total;
}

export async function finishRun(runId: string, userId: string) {
  const run = await prisma.aiBlogRun.findUnique({ where: { id: runId }, include: { items: true } });
  if (!run) throw new RunError("Run not found", 404);
  if (run.createdById !== userId) throw new RunError("This run belongs to another user", 403);
  if (run.status !== "RUNNING") return run;

  await prisma.aiBlogRunItem.updateMany({
    where: { runId, status: { in: ["QUEUED", "RESEARCHING", "WRITING"] } },
    data: { status: "FAILED", error: "Run ended before this post finished." },
  });

  const items = await prisma.aiBlogRunItem.findMany({ where: { runId } });
  const saved = items.filter((item) => item.status === "SAVED").length;
  const status = saved > 0 ? "COMPLETED" : "FAILED";
  const error = saved === 0 && !run.error ? "No posts were generated." : run.error;

  const finished = await prisma.aiBlogRun.update({
    where: { id: runId },
    data: { status, error, finishedAt: new Date() },
    include: { items: true },
  });
  const usage = totalUsage(finished.discoveryUsage, finished.items);
  log("run.finished", { runId, status, saved, failed: items.length - saved, tokens: usage.totalTokens });
  return finished;
}
