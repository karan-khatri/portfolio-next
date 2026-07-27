"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LuFile, LuImage, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { listMediaAction } from "@/app/admin/(protected)/media/actions";
import { MediaUploadForm } from "./media-upload-form";
import { isImageMedia, type MediaPickerValue } from "@/lib/admin/media";
import styles from "./media-picker.module.scss";

function MediaThumb({ item, className }: { item: MediaPickerValue; className: string }) {
  if (!isImageMedia(item)) {
    return (
      <div className={`${className} ${styles.filePlaceholder}`}>
        <LuFile className={styles.fileIcon} />
      </div>
    );
  }
  return (
    <div className={className}>
      <Image
        src={item.url}
        alt={item.altText ?? ""}
        fill
        sizes="(min-width: 640px) 10rem, 33vw"
        placeholder={item.blurDataUrl ? "blur" : undefined}
        blurDataURL={item.blurDataUrl ?? undefined}
        className="object-cover"
      />
    </div>
  );
}

export function MediaPicker({
  label,
  value,
  onChange,
  kind = "image",
}: {
  label: string;
  value: MediaPickerValue | null;
  onChange: (value: MediaPickerValue | null) => void;
  kind?: "image" | "any";
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaPickerValue[] | null>(null);

  useEffect(() => {
    if (!open) return;
    listMediaAction().then(setMedia);
  }, [open]);

  const selectable = media?.filter((item) => kind === "any" || isImageMedia(item)) ?? null;

  function handlePick(item: MediaPickerValue) {
    onChange(item);
    setOpen(false);
  }

  function handleUploaded(item: MediaPickerValue) {
    setMedia((prev) => (prev ? [item, ...prev] : [item]));
    onChange(item);
    setOpen(false);
  }

  return (
    <div className={styles.field}>
      <Label>{label}</Label>
      {value ? (
        <div className={styles.preview}>
          <MediaThumb item={value} className={styles.previewThumb} />
          <div className={styles.previewMeta}>
            <span className={styles.previewFilename}>{value.filename}</span>
            <div className={styles.previewActions}>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                Change
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)}>
                <LuX />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <LuImage />
          {kind === "any" ? "Choose file" : "Choose image"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>{kind === "any" ? "Choose a file" : "Choose an image"}</DialogTitle>
            <DialogDescription>Upload a new file or pick an existing one.</DialogDescription>
          </DialogHeader>

          <MediaUploadForm onUploaded={handleUploaded} kind={kind} />

          {selectable === null ? (
            <p className={styles.loading}>Loading…</p>
          ) : selectable.length === 0 ? (
            <p className={styles.loading}>Nothing uploaded yet.</p>
          ) : (
            <ul className={styles.grid}>
              {selectable.map((item) => (
                <li key={item.id}>
                  <button type="button" className={styles.gridItem} onClick={() => handlePick(item)}>
                    <MediaThumb item={item} className={styles.gridThumb} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
