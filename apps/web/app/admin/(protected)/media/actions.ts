"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import {
  createMedia,
  listMedia,
  deleteMediaRow,
  getMediaUsageCounts,
  logAudit,
  type MediaUsageCounts,
} from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { toMediaPickerValue, type MediaPickerValue } from "@/lib/admin/media";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOCUMENT_TYPES = new Set(["application/pdf"]);
const ALLOWED_TYPES = new Set([...IMAGE_TYPES, ...DOCUMENT_TYPES]);
const MAX_BYTES = 8 * 1024 * 1024;

export interface UploadMediaResult {
  error?: string;
  media?: MediaPickerValue;
}

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function uploadMediaAction(formData: FormData): Promise<UploadMediaResult> {
  try {
    const user = await requireEditor();

    const file = formData.get("file");
    if (!(file instanceof File)) return { error: "No file provided" };
    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: "Unsupported file type. Use JPEG, PNG, WebP, GIF, or PDF." };
    }
    if (file.size > MAX_BYTES) return { error: "File is larger than 8MB." };

    const altTextRaw = formData.get("altText");
    const altText = typeof altTextRaw === "string" ? altTextRaw.trim() || null : null;
    const buffer = Buffer.from(await file.arrayBuffer());
    const isImage = IMAGE_TYPES.has(file.type);

    let width: number | null = null;
    let height: number | null = null;
    let blurDataUrl: string | null = null;

    if (isImage) {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height) return { error: "Could not read image dimensions." };
      width = metadata.width;
      height = metadata.height;

      const blurBuffer = await sharp(buffer).resize(16).webp({ quality: 40 }).toBuffer();
      blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
    }

    const stored = await storage.upload({ buffer, filename: file.name, contentType: file.type });

    const media = await createMedia({
      url: stored.url,
      width,
      height,
      blurDataUrl,
      altText,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedById: user.id,
    });

    await logAudit({
      userId: user.id,
      action: "media.uploaded",
      entity: "Media",
      entityId: media.id,
      metadata: { filename: media.filename },
    });
    revalidatePath("/admin/media");
    return { media: toMediaPickerValue(media) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function deleteMediaAction(id: string): Promise<{ error?: string }> {
  try {
    const user = await requireEditor();
    const media = await deleteMediaRow(id);
    await storage.delete(media.url);
    await logAudit({
      userId: user.id,
      action: "media.deleted",
      entity: "Media",
      entityId: id,
      metadata: { filename: media.filename },
    });
    revalidatePath("/admin/media");
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete image" };
  }
}

export async function getMediaUsageAction(id: string): Promise<MediaUsageCounts> {
  await requireEditor();
  return getMediaUsageCounts(id);
}

export async function listMediaAction(): Promise<MediaPickerValue[]> {
  await requireEditor();
  const { items } = await listMedia();
  return items.map(toMediaPickerValue);
}
