import "server-only";
import {
  getLatestRevision,
  logAudit,
  prisma,
  saveDraft,
  upsertSeo,
  type EntityType,
  type FlatRevisionData,
  type PageRevisionData,
} from "@portfolio/db/server";
import { flatRevisionDataSchema, pageRevisionDataSchema } from "@/lib/revision-data";
import { LOCALES, isAppLocale, type AppLocale } from "@/lib/i18n/config";

export interface TranslationSibling {
  locale: AppLocale;
  id: string | null;
  slug: string | null;
  status: string | null;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function siblingRows(entityType: EntityType, groupId: string) {
  const where = { translationGroupId: groupId };
  const select = { id: true, slug: true, locale: true, status: true };
  if (entityType === "Page") return prisma.page.findMany({ where, select });
  if (entityType === "Project") return prisma.project.findMany({ where, select });
  return prisma.post.findMany({ where, select });
}

export async function getTranslationSiblings(
  entityType: EntityType,
  groupId: string,
): Promise<TranslationSibling[]> {
  const rows = await siblingRows(entityType, groupId);
  return LOCALES.map((locale) => {
    const row = rows.find((candidate) => candidate.locale === locale);
    return {
      locale,
      id: row?.id ?? null,
      slug: row?.slug ?? null,
      status: row?.status ?? null,
    };
  });
}

async function flatSnapshot(entityType: "Post" | "Project", id: string): Promise<FlatRevisionData> {
  const draft = await getLatestRevision(entityType, id, "DRAFT");
  if (draft) return flatRevisionDataSchema.parse(draft.data);

  if (entityType === "Post") {
    const post = await prisma.post.findUniqueOrThrow({ where: { id }, include: { tags: true } });
    return {
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      coverImageId: post.coverImageId,
      authorId: post.authorId,
      tagIds: post.tags.map((tag) => tag.id),
    };
  }

  const project = await prisma.project.findUniqueOrThrow({
    where: { id },
    include: { tags: true, images: { orderBy: { order: "asc" } } },
  });
  return {
    title: project.title,
    excerpt: project.excerpt,
    body: project.body,
    coverImageId: project.coverImageId,
    codeRepository: project.codeRepository,
    liveUrl: project.liveUrl,
    tagIds: project.tags.map((tag) => tag.id),
    galleryImageIds: project.images.map((image) => image.mediaId),
  };
}

async function pageSnapshot(id: string): Promise<PageRevisionData> {
  const draft = await getLatestRevision("Page", id, "DRAFT");
  if (draft) return pageRevisionDataSchema.parse(draft.data);

  const page = await prisma.page.findUniqueOrThrow({
    where: { id },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  return {
    title: page.title,
    sections: page.sections.map((section) => ({
      type: section.type,
      order: section.order,
      enabled: section.enabled,
      content: section.content,
    })),
  };
}

export async function createTranslation(params: {
  entityType: EntityType;
  sourceId: string;
  locale: string;
  slug: string;
  userId: string;
}): Promise<{ id: string }> {
  const { entityType, sourceId, userId } = params;
  const slug = params.slug.trim();

  if (!isAppLocale(params.locale)) throw new Error(`Unknown locale "${params.locale}"`);
  const locale: AppLocale = params.locale;
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error("Slug must be lowercase letters, numbers, and hyphens only");
  }

  const source =
    entityType === "Page"
      ? await prisma.page.findUnique({ where: { id: sourceId }, include: { seo: true } })
      : entityType === "Project"
        ? await prisma.project.findUnique({ where: { id: sourceId }, include: { seo: true } })
        : await prisma.post.findUnique({ where: { id: sourceId }, include: { seo: true } });
  if (!source) throw new Error("Source content not found");
  if (source.locale === locale) throw new Error("Choose a different language than the source");

  const existing = (await siblingRows(entityType, source.translationGroupId)).find(
    (row) => row.locale === locale,
  );
  if (existing) throw new Error("A translation in that language already exists");

  const slugTaken =
    entityType === "Page"
      ? await prisma.page.findUnique({ where: { slug_locale: { slug, locale } } })
      : entityType === "Project"
        ? await prisma.project.findUnique({ where: { slug_locale: { slug, locale } } })
        : await prisma.post.findUnique({ where: { slug_locale: { slug, locale } } });
  if (slugTaken) throw new Error("That slug is already used in the selected language");

  const base = { slug, locale, translationGroupId: source.translationGroupId, status: "DRAFT" as const };
  let createdId: string;

  if (entityType === "Page") {
    const data = await pageSnapshot(sourceId);
    const page = await prisma.page.create({ data: { ...base, title: data.title } });
    createdId = page.id;
    await saveDraft({ entityType, entityId: createdId, data, userId });
  } else {
    const data = await flatSnapshot(entityType, sourceId);
    const common = {
      ...base,
      title: data.title,
      excerpt: data.excerpt ?? null,
      body: data.body ?? null,
      coverImageId: data.coverImageId ?? null,
    };
    if (entityType === "Project") {
      const project = await prisma.project.create({
        data: {
          ...common,
          codeRepository: data.codeRepository ?? null,
          liveUrl: data.liveUrl ?? null,
          tags: { connect: (data.tagIds ?? []).map((id) => ({ id })) },
        },
      });
      createdId = project.id;
    } else {
      const post = await prisma.post.create({
        data: {
          ...common,
          authorId: data.authorId ?? null,
          tags: { connect: (data.tagIds ?? []).map((id) => ({ id })) },
        },
      });
      createdId = post.id;
    }
    await saveDraft({ entityType, entityId: createdId, data, userId });
  }

  if (source.seo?.metaTitle || source.seo?.metaDescription) {
    await upsertSeo({
      entityType,
      entityId: createdId,
      fields: { metaTitle: source.seo.metaTitle, metaDescription: source.seo.metaDescription },
    });
  }

  await logAudit({
    userId,
    action: `${entityType.toLowerCase()}.translation_created`,
    entity: entityType,
    entityId: createdId,
    metadata: { sourceId, locale },
  });

  return { id: createdId };
}
