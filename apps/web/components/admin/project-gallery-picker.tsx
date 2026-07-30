"use client";

import { useState } from "react";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";
import { LuGripVertical, LuImage, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MediaBrowserDialog } from "./media-browser-dialog";
import { useMediaBrowser } from "@/lib/admin/use-media-browser";
import { isImageMedia, type MediaPickerValue } from "@/lib/admin/media";
import styles from "./project-gallery-picker.module.scss";

// Each gallery slot needs an identity independent of the underlying media's
// own id, since the same image can legitimately be picked into more than one
// slot — keying/removing by media.id would treat every slot holding that
// image as the same slot (removing one removes all of them).
export interface GalleryImageEntry {
  galleryKey: string;
  media: MediaPickerValue;
}

function GalleryItem({
  entry,
  onRemove,
}: {
  entry: GalleryImageEntry;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const { media } = entry;

  return (
    <Reorder.Item value={entry} dragListener={false} dragControls={controls} className={styles.item}>
      <button
        type="button"
        onPointerDown={(event) => controls.start(event)}
        className={styles.dragHandle}
        aria-label="Drag to reorder"
      >
        <LuGripVertical className={styles.dragIcon} />
      </button>
      <div className={styles.thumb}>
        {isImageMedia(media) ? (
          <Image
            src={media.url}
            alt={media.altText ?? ""}
            fill
            sizes="6rem"
            placeholder={media.blurDataUrl ? "blur" : undefined}
            blurDataURL={media.blurDataUrl ?? undefined}
            className="object-cover"
          />
        ) : null}
      </div>
      <span className={styles.filename}>{media.filename}</span>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
        <LuX />
      </Button>
    </Reorder.Item>
  );
}

export function ProjectGalleryPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: GalleryImageEntry[];
  onChange: (value: GalleryImageEntry[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const { setMedia, selectable } = useMediaBrowser(open, "image");

  function handlePick(item: MediaPickerValue) {
    onChange([...value, { galleryKey: crypto.randomUUID(), media: item }]);
    setOpen(false);
  }

  function handleUploaded(item: MediaPickerValue) {
    setMedia((prev) => (prev ? [item, ...prev] : [item]));
    onChange([...value, { galleryKey: crypto.randomUUID(), media: item }]);
    setOpen(false);
  }

  function handleRemove(galleryKey: string) {
    onChange(value.filter((entry) => entry.galleryKey !== galleryKey));
  }

  return (
    <div className={styles.field}>
      <Label>{label}</Label>

      {value.length > 0 ? (
        <Reorder.Group axis="y" values={value} onReorder={onChange} className={styles.list}>
          {value.map((entry) => (
            <GalleryItem
              key={entry.galleryKey}
              entry={entry}
              onRemove={() => handleRemove(entry.galleryKey)}
            />
          ))}
        </Reorder.Group>
      ) : null}

      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <LuImage />
        Add image
      </Button>

      <MediaBrowserDialog
        open={open}
        onOpenChange={setOpen}
        title="Choose an image"
        description="Upload a new file or pick an existing one."
        kind="image"
        selectable={selectable}
        onUploaded={handleUploaded}
        dialogClassName={styles.dialogContent}
        loadingClassName={styles.loading}
      >
        {(items) => (
          <ul className={styles.grid}>
            {items.map((item) => (
              <li key={item.id}>
                <button type="button" className={styles.gridItem} onClick={() => handlePick(item)}>
                  <div className={styles.gridThumb}>
                    <Image
                      src={item.url}
                      alt={item.altText ?? ""}
                      fill
                      sizes="96px"
                      placeholder={item.blurDataUrl ? "blur" : undefined}
                      blurDataURL={item.blurDataUrl ?? undefined}
                      className="object-cover"
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </MediaBrowserDialog>
    </div>
  );
}
