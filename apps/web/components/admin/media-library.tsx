"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteMediaAction, getMediaUsageAction } from "@/app/admin/(protected)/media/actions";
import { MediaUploadForm } from "./media-upload-form";
import { formatBytes } from "@/lib/admin/format-bytes";
import type { MediaPickerValue } from "@/lib/admin/media";
import type { MediaUsageCounts } from "@portfolio/db/server";
import styles from "./media-library.module.scss";

function formatUsage(usage: MediaUsageCounts): string {
  const parts = [
    `${usage.projectCovers} project${usage.projectCovers === 1 ? "" : "s"}`,
    `${usage.postCovers} post${usage.postCovers === 1 ? "" : "s"}`,
    `${usage.seo} SEO record${usage.seo === 1 ? "" : "s"}`,
  ];
  return parts.join(", ");
}

function DeleteMediaDialog({
  media,
  open,
  onOpenChange,
  onDeleted,
}: {
  media: MediaPickerValue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const [usage, setUsage] = useState<MediaUsageCounts | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setUsage(null);
      return;
    }
    getMediaUsageAction(media.id).then(setUsage);
  }, [open, media.id]);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMediaAction(media.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Image deleted");
        onDeleted(media.id);
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{media.filename}&rdquo;?</DialogTitle>
          <DialogDescription>
            {usage ? (
              <>
                Currently referenced by: {formatUsage(usage)}. Deleting will remove it from those
                places. Hero/About images inside page content can&rsquo;t be checked here — verify
                manually if this image is used that way.
              </>
            ) : (
              "Checking usage…"
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MediaLibrary({ initialMedia }: { initialMedia: MediaPickerValue[] }) {
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const [deleteTarget, setDeleteTarget] = useState<MediaPickerValue | null>(null);

  useEffect(() => {
    setMedia(initialMedia);
  }, [initialMedia]);

  function handleUploaded(newMedia: MediaPickerValue) {
    setMedia((prev) => [newMedia, ...prev]);
    router.refresh();
  }

  function handleDeleted(id: string) {
    setMedia((prev) => prev.filter((item) => item.id !== id));
    router.refresh();
  }

  return (
    <div className={styles.library}>
      <Card>
        <CardContent>
          <MediaUploadForm onUploaded={handleUploaded} />
        </CardContent>
      </Card>

      {media.length === 0 ? (
        <p className={styles.empty}>No images uploaded yet.</p>
      ) : (
        <ul className={styles.grid}>
          {media.map((item) => (
            <li key={item.id} className={styles.cell}>
              <img src={item.url} alt={item.altText ?? ""} className={styles.thumb} />
              <div className={styles.meta}>
                <span className={styles.filename} title={item.filename}>
                  {item.filename}
                </span>
                <span className={styles.dims}>
                  {item.width}×{item.height} · {formatBytes(item.sizeBytes)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={styles.deleteButton}
                aria-label={`Delete ${item.filename}`}
                onClick={() => setDeleteTarget(item)}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget ? (
        <DeleteMediaDialog
          media={deleteTarget}
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onDeleted={handleDeleted}
        />
      ) : null}
    </div>
  );
}
