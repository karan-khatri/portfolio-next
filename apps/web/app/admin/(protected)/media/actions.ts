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
import { requireEditor } from "@/lib/auth/require-admin";
import { storage } from "@/lib/storage";
import { toMediaPickerValue, type MediaPickerValue } from "@/lib/admin/media";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOCUMENT_TYPES = new Set(["application/pdf"]);
const ALLOWED_TYPES = new Set([...IMAGE_TYPES, ...DOCUMENT_TYPES]);
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * The client-supplied `file.type` is just a string the caller chose — it isn't
 * proof of what's actually in the buffer. Sniff the real format from magic
 * bytes so an upload can't claim "image/png" while smuggling in something
 * else (e.g. an SVG/HTML payload) that later gets served back to browsers.
 */
function sniffContentType(buffer: Buffer): string | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 6 &&
    (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a")
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-") {
    return "application/pdf";
  }
  return null;
}

export interface UploadMediaResult {
  error?: string;
  media?: MediaPickerValue;
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

    const sniffed = sniffContentType(buffer);
    if (!sniffed || sniffed !== file.type) {
      return { error: "File content doesn't match its declared type." };
    }

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
