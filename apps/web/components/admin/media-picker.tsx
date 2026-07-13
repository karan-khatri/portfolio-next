"use client";

import { useEffect, useState } from "react";
import { ImageIcon, XIcon } from "lucide-react";
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
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./media-picker.module.scss";

export function MediaPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MediaPickerValue | null;
  onChange: (value: MediaPickerValue | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaPickerValue[] | null>(null);

  useEffect(() => {
    if (!open) return;
    listMediaAction().then(setMedia);
  }, [open]);

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
          <img src={value.url} alt={value.altText ?? ""} className={styles.previewThumb} />
          <div className={styles.previewMeta}>
            <span className={styles.previewFilename}>{value.filename}</span>
            <div className={styles.previewActions}>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                Change
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)}>
                <XIcon />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <ImageIcon />
          Choose image
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Choose an image</DialogTitle>
            <DialogDescription>Upload a new image or pick an existing one.</DialogDescription>
          </DialogHeader>

          <MediaUploadForm onUploaded={handleUploaded} />

          {media === null ? (
            <p className={styles.loading}>Loading…</p>
          ) : media.length === 0 ? (
            <p className={styles.loading}>No images uploaded yet.</p>
          ) : (
            <ul className={styles.grid}>
              {media.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.gridItem}
                    onClick={() => handlePick(item)}
                  >
                    <img src={item.url} alt={item.altText ?? ""} className={styles.gridThumb} />
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
