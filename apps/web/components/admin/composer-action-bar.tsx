"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import styles from "./composer-action-bar.module.scss";

// Shared by every draft/publish/preview/unpublish content editor (Page,
// Project, Post) — one place for the button hierarchy (Publish primary,
// Save draft/Preview secondary, Unpublish visually separated) and the
// sticky-in-flow positioning fix the sidebar migration required.
export function ComposerActionBar({
  pending,
  onSaveDraft,
  onPreview,
  onPublish,
  onUnpublish,
}: {
  pending: boolean;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  return (
    <div className={styles.actionBar}>
      <Button type="button" onClick={onPublish} disabled={pending}>
        Publish
      </Button>
      <Button type="button" variant="outline" onClick={onSaveDraft} disabled={pending}>
        {pending ? <Loader2Icon className={styles.spinner} /> : null}
        Save draft
      </Button>
      <Button type="button" variant="ghost" onClick={onPreview} disabled={pending}>
        Preview
      </Button>
      <Separator orientation="vertical" className={styles.actionSeparator} />
      <Button type="button" variant="destructive" onClick={onUnpublish} disabled={pending}>
        Unpublish
      </Button>
    </div>
  );
}
