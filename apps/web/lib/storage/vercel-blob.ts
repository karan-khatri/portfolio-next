import { put, del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import type { StorageAdapter, StoredFile } from "./types";

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

export class VercelBlobStorageAdapter implements StorageAdapter {
  async upload({
    buffer,
    filename,
    contentType,
  }: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  }): Promise<StoredFile> {
    // Same fix as LocalDiskStorageAdapter: extension must come only from the
    // (already allowlist- and magic-byte-validated) content type, never from
    // the caller-supplied filename.
    const ext = EXTENSION_BY_MIME_TYPE[contentType] || "";
    const key = `${randomUUID()}${ext}`;
    const blob = await put(key, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  async delete(url: string): Promise<void> {
    await del(url).catch(() => {});
  }
}
