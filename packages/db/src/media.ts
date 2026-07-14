import { prisma } from "./client";

export interface CreateMediaInput {
  url: string;
  width: number;
  height: number;
  blurDataUrl?: string | null;
  altText?: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById?: string | null;
}

export async function createMedia(input: CreateMediaInput) {
  return prisma.media.create({ data: input });
}

// `skip`/`take` are optional so existing callers (e.g. the MediaPicker
// dialog, which wants every image to choose from) keep getting the full,
// unpaginated list — only the admin Media library page passes them.
export async function listMedia(options?: { skip?: number; take?: number }) {
  const [items, total] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.media.count(),
  ]);
  return { items, total };
}

export async function getMediaByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.media.findMany({ where: { id: { in: ids } } });
}

export interface MediaUsageCounts {
  seo: number;
  projectCovers: number;
  postCovers: number;
}

// Best-effort usage check for the delete-confirm warning — covers every
// relation backed by a real FK. Hero/About images live inside a page
// section's JSON content blob (no FK), so they can't be counted here.
export async function getMediaUsageCounts(mediaId: string): Promise<MediaUsageCounts> {
  const [seo, projectCovers, postCovers] = await Promise.all([
    prisma.seo.count({ where: { ogImageId: mediaId } }),
    prisma.project.count({ where: { coverImageId: mediaId } }),
    prisma.post.count({ where: { coverImageId: mediaId } }),
  ]);
  return { seo, projectCovers, postCovers };
}

// Relies on the Media relations already being ON DELETE SET NULL at the DB
// level — no manual unlinking needed before this.
export async function deleteMediaRow(id: string) {
  return prisma.media.delete({ where: { id } });
}
