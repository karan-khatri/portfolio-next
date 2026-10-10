import "server-only";
import {
  logAudit,
  prisma,
  resolveTagIds,
  saveDraft,
  upsertSeo,
} from "@portfolio/db/server";
import { uniqueSlug } from "./dedupe";
import type { GeneratedPost } from "./schemas";

const MAX_SLUG_ATTEMPTS = 5;

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

async function takenSlugs(base: string): Promise<Set<string>> {
  const rows = await prisma.post.findMany({
    where: { locale: "en", slug: { startsWith: base } },
    select: { slug: true },
  });
  return new Set(rows.map((row) => row.slug));
}

export async function saveGeneratedPostAsDraft(params: {
  post: GeneratedPost;
  userId: string;
  runId: string;
}): Promise<{ postId: string; slug: string }> {
  const { post, userId, runId } = params;

  const author = await prisma.author.findFirst({ orderBy: { name: "asc" }, select: { id: true } });
  const tagIds = await resolveTagIds(post.tags);

  let created: { id: string; slug: string } | null = null;
  let slug = uniqueSlug(post.slug, await takenSlugs(post.slug));

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS && !created; attempt++) {
    try {
      created = await prisma.post.create({
        data: {
          slug,
          locale: "en",
          translationGroupId: slug,
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          status: "DRAFT",
          authorId: author?.id ?? null,
          tags: { connect: tagIds.map((id) => ({ id })) },
        },
        select: { id: true, slug: true },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      slug = uniqueSlug(post.slug, await takenSlugs(post.slug));
    }
  }

  if (!created) throw new Error("Could not find a free slug for the generated post");

  try {
    await saveDraft({
      entityType: "Post",
      entityId: created.id,
      userId,
      data: {
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        tagIds,
        coverImageId: null,
        authorId: author?.id ?? null,
      },
    });
    await upsertSeo({
      entityType: "Post",
      entityId: created.id,
      fields: { metaTitle: post.meta_title, metaDescription: post.meta_description },
    });
    await logAudit({
      userId,
      action: "post.ai_generated",
      entity: "Post",
      entityId: created.id,
      metadata: { runId, sourceUrls: post.source_urls },
    });
  } catch (error) {
    await prisma.post.delete({ where: { id: created.id } }).catch(() => null);
    throw error;
  }

  return { postId: created.id, slug: created.slug };
}
