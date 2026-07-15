"use client";

import { useEffect, useState } from "react";
import { FolderOpenIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import styles from "./media-url-field.module.scss";

// A plain URL text field (for pasting an external link) plus a "browse
// Media" button — for settings that store a bare URL string rather than a
// Media relation (e.g. Site Settings' Resume URL). Picking or uploading a
// file here just copies its `url` into the text field; nothing keeps the
// two in sync afterwards, matching how the field is stored (a plain string).
export function MediaUrlField({
  id,
  value,
  onChange,
  placeholder,
  icon,
  kind = "any",
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
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
    onChange(item.url);
    setOpen(false);
  }

  function handleUploaded(item: MediaPickerValue) {
    onChange(item.url);
    setOpen(false);
  }

  return (
    <div className={styles.wrap}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <Input
        id={id}
        placeholder={placeholder}
        className={icon ? styles.inputWithIcon : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button type="button" variant="outline" size="icon-sm" onClick={() => setOpen(true)} aria-label="Browse media">
        <FolderOpenIcon />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Choose a file</DialogTitle>
            <DialogDescription>Upload a new file or pick an existing one from Media.</DialogDescription>
          </DialogHeader>

          <MediaUploadForm onUploaded={handleUploaded} kind={kind} />

          {selectable === null ? (
            <p className={styles.loading}>Loading…</p>
          ) : selectable.length === 0 ? (
            <p className={styles.loading}>Nothing uploaded yet.</p>
          ) : (
            <ul className={styles.list}>
              {selectable.map((item) => (
                <li key={item.id}>
                  <button type="button" className={styles.listItem} onClick={() => handlePick(item)}>
                    <span className={styles.listItemName}>{item.filename}</span>
                    <span className={styles.listItemUrl}>{item.url}</span>
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
