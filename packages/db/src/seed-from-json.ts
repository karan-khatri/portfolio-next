import { prisma } from "./client";
import { assertHasActiveRole } from "./auth";
import { saveDraft, publishRevision, type PageSectionInput } from "./cms";
import { resolveTagIds } from "./tags";
import { upsertSiteSettings, getSiteSettings, type SiteSettingsValues } from "./site-settings";
import { upsertSeo, type SeoFields } from "./seo";
import type { SectionType, Prisma } from "./generated/client";

export interface SeedSeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  structuredData?: Record<string, unknown> | null;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface SeedMediaItem {
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  altText: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface SeedTechStackItem {
  name: string;
  imageUrl: string | null;
  order: number;
}

export interface SeedProjectInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImageUrl: string | null;
  codeRepository: string | null;
  liveUrl: string | null;
  featured: boolean;
  featuredOrder: number | null;
  seo: SeedSeoFields | null;
  images: string[];
  publish: boolean;
}

export interface SeedSectionInput {
  type: SectionType;
  order: number;
  enabled: boolean;
  content: Record<string, unknown>;
}

export interface SeedExperienceInput {
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

export interface SeedEducationInput {
  institution: string;
  degree: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

export interface SeedLanguageInput {
  name: string;
  proficiency: string;
}

export interface SeedSkillInput {
  name: string;
  category: string | null;
}

export interface SeedPayload {
  media?: SeedMediaItem[];
  techStack?: SeedTechStackItem[];
  siteSettings?: SiteSettingsValues;
  projects?: SeedProjectInput[];
  homePageSections?: SeedSectionInput[];
  resumeExperience?: SeedExperienceInput[];
  resumeEducation?: SeedEducationInput[];
  resumeLanguages?: SeedLanguageInput[];
  resumeSkills?: SeedSkillInput[];
}

export interface SeedApplyResult {
  media?: { created: number; updated: number };
  techStack?: { created: number; updated: number };
  siteSettings?: boolean;
  projects?: { created: number; updated: number };
  homePageSections?: number;
  resumeExperience?: number;
  resumeEducation?: number;
  resumeLanguages?: number;
  resumeSkills?: number;
}

async function applyMedia(
  items: SeedMediaItem[],
  adminId: string,
): Promise<{ idByUrl: Map<string, string>; counts: { created: number; updated: number } }> {
  const idByUrl = new Map<string, string>();
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const existing = await prisma.media.findUnique({ where: { url: item.url } });
    const media = await prisma.media.upsert({
      where: { url: item.url },
      update: {
        width: item.width,
        height: item.height,
        blurDataUrl: item.blurDataUrl,
        altText: item.altText,
        filename: item.filename,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
      },
      create: { ...item, uploadedById: adminId },
    });
    idByUrl.set(item.url, media.id);
    if (existing) updated++;
    else created++;
  }

  return { idByUrl, counts: { created, updated } };
}

async function applyTechStack(items: SeedTechStackItem[]): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const existing = await prisma.techStackItem.findUnique({ where: { name: item.name } });
    await prisma.techStackItem.upsert({
      where: { name: item.name },
      update: { imageUrl: item.imageUrl, order: item.order },
      create: item,
    });
    if (existing) updated++;
    else created++;
  }

  return { created, updated };
}

function collectReferencedMediaUrls(payload: SeedPayload): string[] {
  const urls = new Set<string>();
  for (const project of payload.projects ?? []) {
    if (project.coverImageUrl) urls.add(project.coverImageUrl);
    if (project.seo?.ogImageUrl) urls.add(project.seo.ogImageUrl);
    for (const url of project.images) urls.add(url);
  }
  for (const section of payload.homePageSections ?? []) {
    const imageUrl = section.content.imageUrl;
    if (typeof imageUrl === "string") urls.add(imageUrl);
  }
  return [...urls];
}

async function applyProjects(
  items: SeedProjectInput[],
  adminId: string,
  mediaIdByUrl: Map<string, string>,
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  const projectIds: string[] = [];

  for (const entry of items) {
    const existing = await prisma.project.findUnique({
      where: { slug_locale: { slug: entry.slug, locale: "en" } },
    });
    const project = await prisma.project.upsert({
      where: { slug_locale: { slug: entry.slug, locale: "en" } },
      update: {},
      create: {
        slug: entry.slug,
        locale: "en",
        translationGroupId: entry.slug,
        title: entry.title,
        status: "DRAFT",
      },
    });
    if (existing) updated++;
    else created++;
    projectIds.push(project.id);
  }

  const incomingOrders = items.map((entry) => entry.featuredOrder).filter((order): order is number => order != null);
  if (incomingOrders.length > 0) {
    await prisma.project.updateMany({
      where: { featuredOrder: { in: incomingOrders } },
      data: { featuredOrder: null },
    });
  }

  for (let i = 0; i < items.length; i++) {
    const entry = items[i];
    const projectId = projectIds[i];
    const tagIds = await resolveTagIds(entry.tags);
    const coverImageId = entry.coverImageUrl ? (mediaIdByUrl.get(entry.coverImageUrl) ?? null) : null;
    const galleryImageIds = entry.images
      .map((url) => mediaIdByUrl.get(url))
      .filter((id): id is string => Boolean(id));

    const revision = await saveDraft({
      entityType: "Project",
      entityId: projectId,
      data: {
        title: entry.title,
        excerpt: entry.excerpt,
        body: entry.body,
        tagIds,
        coverImageId,
        codeRepository: entry.codeRepository,
        liveUrl: entry.liveUrl,
        galleryImageIds,
      },
      userId: adminId,
    });
    if (entry.publish) {
      await publishRevision({
        entityType: "Project",
        entityId: projectId,
        revisionId: revision.id,
        userId: adminId,
      });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { featured: entry.featured, featuredOrder: entry.featuredOrder },
    });

    if (entry.seo) {
      const { ogImageUrl, structuredData, ...seoRest } = entry.seo;
      const fields: SeoFields = {
        ...seoRest,
        ogImageId: ogImageUrl ? (mediaIdByUrl.get(ogImageUrl) ?? null) : null,
        structuredData: structuredData as Prisma.InputJsonValue | null,
      };
      await upsertSeo({ entityType: "Project", entityId: projectId, fields });
    }
  }

  return { created, updated };
}

async function applyHomePage(
  sections: SeedSectionInput[],
  adminId: string,
  mediaIdByUrl: Map<string, string>,
): Promise<number> {
  const homePage = await prisma.page.upsert({
    where: { slug_locale: { slug: "home", locale: "en" } },
    update: {},
    create: {
      slug: "home",
      locale: "en",
      translationGroupId: "home",
      title: "Home",
      status: "DRAFT",
    },
  });

  const resolvedSections: PageSectionInput[] = sections.map((section) => {
    const content = { ...section.content };
    const imageUrl = content.imageUrl;
    if (typeof imageUrl === "string") {
      delete content.imageUrl;
      const imageId = mediaIdByUrl.get(imageUrl);
      if (imageId) content.imageId = imageId;
    }
    return { type: section.type, order: section.order, enabled: section.enabled, content };
  });

  const revision = await saveDraft({
    entityType: "Page",
    entityId: homePage.id,
    data: { title: homePage.title, sections: resolvedSections },
    userId: adminId,
  });
  await publishRevision({
    entityType: "Page",
    entityId: homePage.id,
    revisionId: revision.id,
    userId: adminId,
  });

  return sections.length;
}

async function replaceResumeExperience(items: SeedExperienceInput[]): Promise<number> {
  await prisma.$transaction([
    prisma.experience.deleteMany({ where: { locale: "en" } }),
    prisma.experience.createMany({
      data: items.map((entry, index) => ({ locale: "en" as const, ...entry, order: index })),
    }),
  ]);
  return items.length;
}

async function replaceResumeEducation(items: SeedEducationInput[]): Promise<number> {
  await prisma.$transaction([
    prisma.education.deleteMany({ where: { locale: "en" } }),
    prisma.education.createMany({
      data: items.map((entry, index) => ({ locale: "en" as const, ...entry, order: index })),
    }),
  ]);
  return items.length;
}

async function replaceResumeLanguages(items: SeedLanguageInput[]): Promise<number> {
  await prisma.$transaction([
    prisma.language.deleteMany({ where: { locale: "en" } }),
    prisma.language.createMany({
      data: items.map((entry, index) => ({ locale: "en" as const, ...entry, order: index })),
    }),
  ]);
  return items.length;
}

async function replaceResumeSkills(items: SeedSkillInput[]): Promise<number> {
  await prisma.$transaction([
    prisma.skill.deleteMany({ where: { locale: "en" } }),
    prisma.skill.createMany({
      data: items.map((entry, index) => ({ locale: "en" as const, ...entry, order: index })),
    }),
  ]);
  return items.length;
}

export async function applySeedPayload(payload: SeedPayload, adminId: string): Promise<SeedApplyResult> {
  await assertHasActiveRole(adminId);

  const result: SeedApplyResult = {};
  const mediaIdByUrl = new Map<string, string>();

  if (payload.media) {
    const { idByUrl, counts } = await applyMedia(payload.media, adminId);
    for (const [url, id] of idByUrl) mediaIdByUrl.set(url, id);
    result.media = counts;
  }

  const referencedUrls = collectReferencedMediaUrls(payload).filter((url) => !mediaIdByUrl.has(url));
  if (referencedUrls.length > 0) {
    const rows = await prisma.media.findMany({ where: { url: { in: referencedUrls } } });
    for (const row of rows) mediaIdByUrl.set(row.url, row.id);
  }

  if (payload.techStack) {
    result.techStack = await applyTechStack(payload.techStack);
  }

  if (payload.siteSettings) {
    await upsertSiteSettings(payload.siteSettings);
    result.siteSettings = true;
  }

  if (payload.projects) {
    result.projects = await applyProjects(payload.projects, adminId, mediaIdByUrl);
  }

  if (payload.homePageSections) {
    result.homePageSections = await applyHomePage(payload.homePageSections, adminId, mediaIdByUrl);
  }

  if (payload.resumeExperience) result.resumeExperience = await replaceResumeExperience(payload.resumeExperience);
  if (payload.resumeEducation) result.resumeEducation = await replaceResumeEducation(payload.resumeEducation);
  if (payload.resumeLanguages) result.resumeLanguages = await replaceResumeLanguages(payload.resumeLanguages);
  if (payload.resumeSkills) result.resumeSkills = await replaceResumeSkills(payload.resumeSkills);

  return result;
}

export async function exportSeedPayload(): Promise<SeedPayload> {
  const [media, techStack, siteSettings, projects, homePage, experience, education, languages, skills] =
    await Promise.all([
      prisma.media.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.techStackItem.findMany({ orderBy: { order: "asc" } }),
      getSiteSettings(),
      prisma.project.findMany({
        where: { locale: "en" },
        include: {
          tags: true,
          coverImage: true,
          seo: { include: { ogImage: true } },
          images: { include: { media: true }, orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.page.findUnique({
        where: { slug_locale: { slug: "home", locale: "en" } },
        include: { sections: { orderBy: { order: "asc" } } },
      }),
      prisma.experience.findMany({ where: { locale: "en" }, orderBy: { order: "asc" } }),
      prisma.education.findMany({ where: { locale: "en" }, orderBy: { order: "asc" } }),
      prisma.language.findMany({ where: { locale: "en" }, orderBy: { order: "asc" } }),
      prisma.skill.findMany({ where: { locale: "en" }, orderBy: { order: "asc" } }),
    ]);

  return {
    media: media.map((item) => ({
      url: item.url,
      width: item.width,
      height: item.height,
      blurDataUrl: item.blurDataUrl,
      altText: item.altText,
      filename: item.filename,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
    })),
    techStack: techStack.map((item) => ({ name: item.name, imageUrl: item.imageUrl, order: item.order })),
    siteSettings,
    projects: projects.map((project) => ({
      slug: project.slug,
      title: project.title,
      excerpt: project.excerpt ?? "",
      body: project.body ?? "",
      tags: project.tags.map((tag) => tag.name),
      coverImageUrl: project.coverImage?.url ?? null,
      codeRepository: project.codeRepository,
      liveUrl: project.liveUrl,
      featured: project.featured,
      featuredOrder: project.featuredOrder,
      publish: project.status === "PUBLISHED",
      seo: project.seo
        ? {
            metaTitle: project.seo.metaTitle,
            metaDescription: project.seo.metaDescription,
            canonicalUrl: project.seo.canonicalUrl,
            ogImageUrl: project.seo.ogImage?.url ?? null,
            structuredData: project.seo.structuredData as Record<string, unknown> | null,
            noindex: project.seo.noindex,
            nofollow: project.seo.nofollow,
          }
        : null,
      images: project.images.map((entry) => entry.media.url),
    })),
    homePageSections:
      homePage?.sections.map((section) => ({
        type: section.type,
        order: section.order,
        enabled: section.enabled,
        content: section.content as Record<string, unknown>,
      })) ?? [],
    resumeExperience: experience.map((entry) => ({
      company: entry.company,
      title: entry.title,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description: entry.description,
    })),
    resumeEducation: education.map((entry) => ({
      institution: entry.institution,
      degree: entry.degree,
      location: entry.location,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description: entry.description,
    })),
    resumeLanguages: languages.map((entry) => ({ name: entry.name, proficiency: entry.proficiency })),
    resumeSkills: skills.map((entry) => ({ name: entry.name, category: entry.category })),
  };
}
