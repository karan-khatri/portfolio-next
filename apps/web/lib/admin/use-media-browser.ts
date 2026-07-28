"use client";

import { useEffect, useState } from "react";
import { listMediaAction } from "@/app/admin/(protected)/media/actions";
import { isImageMedia, type MediaPickerValue } from "@/lib/admin/media";

export function useMediaBrowser(open: boolean, kind: "image" | "any") {
  const [media, setMedia] = useState<MediaPickerValue[] | null>(null);

  useEffect(() => {
    if (!open) return;
    listMediaAction().then(setMedia);
  }, [open]);

  const selectable = media?.filter((item) => kind === "any" || isImageMedia(item)) ?? null;

  return { media, setMedia, selectable };
}
