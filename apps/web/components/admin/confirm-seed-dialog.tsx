"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { LuTriangleAlert } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { applySeedJsonAction, type SeedUploadResult } from "@/app/admin/(protected)/seed/actions";
import styles from "./confirm-seed-dialog.module.scss";

export function ConfirmSeedDialog({
  open,
  onOpenChange,
  formData,
  onApplied,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  onApplied: (summary: SeedUploadResult["summary"]) => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await applySeedJsonAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Database updated");
        onApplied(result.summary);
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply this JSON to the database?</DialogTitle>
          <DialogDescription>
            This updates any existing content that matches by slug/name/key with what&rsquo;s in the file.
          </DialogDescription>
        </DialogHeader>
        <div className={styles.warning}>
          <LuTriangleAlert className={styles.warningIcon} />
          <span className={styles.warningText}>
            Not reversible except by re-uploading a previous export. Resume sections
            (experience/education/languages/skills) are fully replaced, not merged, whenever included.
          </span>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={handleConfirm}>
            {pending ? "Applying…" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
