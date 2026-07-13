export interface StoredFile {
  url: string;
}

export interface StorageAdapter {
  upload(params: { buffer: Buffer; filename: string; contentType: string }): Promise<StoredFile>;
  delete(url: string): Promise<void>;
}
