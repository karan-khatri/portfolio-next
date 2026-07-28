"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ComposerActionResult } from "@/lib/admin/action-result";

export interface EntityEditorActions {
  saveDraft: () => Promise<ComposerActionResult>;
  publish: () => Promise<ComposerActionResult>;
  unpublish: () => Promise<ComposerActionResult>;
  createPreview: () => Promise<ComposerActionResult>;
}

export function useEntityEditor(actions: EntityEditorActions) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await actions.saveDraft();
      if (result.error) toast.error(result.error);
      else toast.success("Draft saved");
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await actions.publish();
      if (result.error) toast.error(result.error);
      else {
        toast.success("Published");
        router.refresh();
      }
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const result = await actions.unpublish();
      if (result.error) toast.error(result.error);
      else {
        toast.success("Unpublished");
        router.refresh();
      }
    });
  }

  function handlePreview() {
    setPreviewUrl(null);
    startTransition(async () => {
      const result = await actions.createPreview();
      if (result.error) toast.error(result.error);
      else if (result.previewToken) setPreviewUrl(`/preview/${result.previewToken}`);
    });
  }

  function copyPreviewLink() {
    if (!previewUrl) return;
    navigator.clipboard.writeText(`${window.location.origin}${previewUrl}`);
    toast.success("Copied preview link");
  }

  return {
    pending,
    previewUrl,
    handleSaveDraft,
    handlePublish,
    handleUnpublish,
    handlePreview,
    copyPreviewLink,
  };
}
