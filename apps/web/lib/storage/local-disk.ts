import { writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageAdapter, StoredFile } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

// Dev-only stand-in: writes into apps/web/public/uploads and serves the
// result at /uploads/<file>. Vercel's serverless functions have a
// READ-ONLY filesystem outside /tmp, so this adapter will NOT work once
// deployed there. Swap the `storage` export in ./index.ts for a Vercel
// Blob (or S3/R2) adapter implementing the same StorageAdapter interface
// before shipping — no other call site needs to change.
export class LocalDiskStorageAdapter implements StorageAdapter {
  async upload({
    buffer,
    filename,
    contentType,
  }: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  }): Promise<StoredFile> {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(filename) || EXTENSION_BY_MIME_TYPE[contentType] || "";
    const key = `${randomUUID()}${ext}`;
    await writeFile(path.join(UPLOAD_DIR, key), buffer);
    return { url: `/uploads/${key}` };
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const key = url.slice("/uploads/".length);
    const target = path.join(UPLOAD_DIR, key);
    if (!target.startsWith(UPLOAD_DIR)) return;
    try {
      await unlink(target);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }
}
