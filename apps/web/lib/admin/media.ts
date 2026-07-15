export interface MediaPickerValue {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  altText: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export function toMediaPickerValue(media: {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  altText: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): MediaPickerValue {
  const { id, url, width, height, blurDataUrl, altText, filename, mimeType, sizeBytes } = media;
  return { id, url, width, height, blurDataUrl, altText, filename, mimeType, sizeBytes };
}

export function isImageMedia(media: Pick<MediaPickerValue, "mimeType">): boolean {
  return media.mimeType.startsWith("image/");
}
