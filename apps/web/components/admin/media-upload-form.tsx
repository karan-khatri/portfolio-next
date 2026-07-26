"use client";

import { useId, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { LuCloudUpload, LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMediaAction } from "@/app/admin/(protected)/media/actions";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./media-upload-form.module.scss";

const ACCEPT_BY_KIND = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  any: "image/jpeg,image/png,image/webp,image/gif,application/pdf",
} as const;

const HINT_BY_KIND = {
  image: "Click to browse — JPEG, PNG, WebP, GIF, up to 8MB",
  any: "Click to browse — JPEG, PNG, WebP, GIF, or PDF, up to 8MB",
} as const;

export function MediaUploadForm({
  onUploaded,
  kind = "image",
}: {
  onUploaded: (media: MediaPickerValue) => void;
  kind?: "image" | "any";
}) {
  const fileInputId = useId();
  const altTextId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.media) {
        toast.success("Uploaded");
        onUploaded(result.media);
        formRef.current?.reset();
        setFileName(null);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor={fileInputId}>{kind === "any" ? "File" : "Image"}</Label>
        <label htmlFor={fileInputId} className={styles.fileTrigger}>
          <span className={styles.fileIconWrap}>
            <LuCloudUpload className={styles.fileIcon} />
          </span>
          <span className={styles.fileTitle}>{fileName ?? "Upload media"}</span>
          <span className={styles.fileHint}>{fileName ? "Ready to upload" : HINT_BY_KIND[kind]}</span>
        </label>
        <input
          id={fileInputId}
          name="file"
          type="file"
          accept={ACCEPT_BY_KIND[kind]}
          required
          className={styles.fileInput}
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        />
      </div>
      <div className={styles.field}>
        <Label htmlFor={altTextId}>Alt text</Label>
        <Input id={altTextId} name="altText" placeholder="Describe the image for screen readers" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
        {pending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
