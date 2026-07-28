"use client";

import { useState } from "react";
import { LuFolderOpen } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaBrowserDialog } from "./media-browser-dialog";
import { useMediaBrowser } from "@/lib/admin/use-media-browser";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./media-url-field.module.scss";

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
  const { selectable } = useMediaBrowser(open, kind);

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
        <LuFolderOpen />
      </Button>

      <MediaBrowserDialog
        open={open}
        onOpenChange={setOpen}
        title="Choose a file"
        description="Upload a new file or pick an existing one from Media."
        kind={kind}
        selectable={selectable}
        onUploaded={handleUploaded}
        dialogClassName={styles.dialogContent}
        loadingClassName={styles.loading}
      >
        {(items) => (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id}>
                <button type="button" className={styles.listItem} onClick={() => handlePick(item)}>
                  <span className={styles.listItemName}>{item.filename}</span>
                  <span className={styles.listItemUrl}>{item.url}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </MediaBrowserDialog>
    </div>
  );
}
