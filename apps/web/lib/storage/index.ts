import "server-only";
import { LocalDiskStorageAdapter } from "./local-disk";
import { VercelBlobStorageAdapter } from "./vercel-blob";
import type { StorageAdapter } from "./types";

export type { StorageAdapter, StoredFile } from "./types";

export const storage: StorageAdapter = process.env.BLOB_READ_WRITE_TOKEN
  ? new VercelBlobStorageAdapter()
  : new LocalDiskStorageAdapter();
