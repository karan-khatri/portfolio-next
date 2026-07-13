import "server-only";
import { LocalDiskStorageAdapter } from "./local-disk";
import type { StorageAdapter } from "./types";

export type { StorageAdapter, StoredFile } from "./types";

// Single swap point: every call site imports `storage` from here, never a
// concrete adapter class, so moving off local disk (e.g. to Vercel Blob
// before deploying) is a one-line change in this file.
export const storage: StorageAdapter = new LocalDiskStorageAdapter();
