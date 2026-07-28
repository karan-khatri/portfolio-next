"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MediaUploadForm } from "./media-upload-form";
import type { MediaPickerValue } from "@/lib/admin/media";

export function MediaBrowserDialog({
  open,
  onOpenChange,
  title,
  description,
  kind,
  selectable,
  onUploaded,
  dialogClassName,
  loadingClassName,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  kind: "image" | "any";
  selectable: MediaPickerValue[] | null;
  onUploaded: (item: MediaPickerValue) => void;
  dialogClassName?: string;
  loadingClassName?: string;
  children: (selectable: MediaPickerValue[]) => React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <MediaUploadForm onUploaded={onUploaded} kind={kind} />

        {selectable === null ? (
          <p className={loadingClassName}>Loading…</p>
        ) : selectable.length === 0 ? (
          <p className={loadingClassName}>Nothing uploaded yet.</p>
        ) : (
          children(selectable)
        )}
      </DialogContent>
    </Dialog>
  );
}
