"use client";

import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import styles from "./composer-action-bar.module.scss";

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
        {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
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
