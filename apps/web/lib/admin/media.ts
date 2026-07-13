export interface MediaPickerValue {
  id: string;
  url: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
  altText: string | null;
  filename: string;
  sizeBytes: number;
}

export function toMediaPickerValue(media: {
  id: string;
  url: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
  altText: string | null;
  filename: string;
  sizeBytes: number;
}): MediaPickerValue {
  const { id, url, width, height, blurDataUrl, altText, filename, sizeBytes } = media;
  return { id, url, width, height, blurDataUrl, altText, filename, sizeBytes };
}
