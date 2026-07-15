import { prisma } from "./client";

export interface CreateMediaInput {
  url: string;
  width?: number | null;
  height?: number | null;
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

export async function listMedia(options?: { skip?: number; take?: number; query?: string }) {
  const where = options?.query
    ? { filename: { contains: options.query, mode: "insensitive" as const } }
    : {};
  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.media.count({ where }),
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

export async function getMediaUsageCounts(mediaId: string): Promise<MediaUsageCounts> {
  const [seo, projectCovers, postCovers] = await Promise.all([
    prisma.seo.count({ where: { ogImageId: mediaId } }),
    prisma.project.count({ where: { coverImageId: mediaId } }),
    prisma.post.count({ where: { coverImageId: mediaId } }),
  ]);
  return { seo, projectCovers, postCovers };
}

export async function deleteMediaRow(id: string) {
  return prisma.media.delete({ where: { id } });
}
