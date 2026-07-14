"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HistoryIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { restoreRevisionAction } from "@/app/admin/(protected)/revision-actions";
import type { EntityType } from "@portfolio/db/server";
import styles from "./revision-history-panel.module.scss";

export interface RevisionHistoryItem {
  id: string;
  status: string;
  createdAt: Date;
  createdByEmail: string | null;
}

function RevisionRow({
  entityType,
  entityId,
  revision,
  isCurrent,
}: {
  entityType: EntityType;
  entityId: string;
  revision: RevisionHistoryItem;
  isCurrent: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreRevisionAction(entityType, entityId, revision.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Restored as new draft");
        router.refresh();
      }
    });
  }

  return (
    <li className={styles.row} data-current={isCurrent || undefined}>
      <div className={styles.rowTop}>
        <span className={styles.rowTopLeft}>
          <StatusBadge status={revision.status} />
          {isCurrent ? <span className={styles.currentTag}>Current</span> : null}
        </span>
        <time className={styles.time} dateTime={revision.createdAt.toISOString()}>
          {formatRelativeTime(revision.createdAt)}
        </time>
      </div>
      <div className={styles.rowBottom}>
        <span className={styles.meta}>{revision.createdByEmail ?? "—"}</span>
        {!isCurrent ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={styles.restoreButton}
            disabled={pending}
            onClick={handleRestore}
          >
            {pending ? <Loader2Icon className={styles.spinner} /> : null}
            Restore
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export function RevisionHistoryPanel({
  entityType,
  entityId,
  revisions,
}: {
  entityType: EntityType;
  entityId: string;
  revisions: RevisionHistoryItem[];
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <HistoryIcon className={styles.headerIcon} />
        <h3 className={styles.headerTitle}>Revision History</h3>
      </div>
      {revisions.length === 0 ? (
        <p className={styles.empty}>No revisions yet.</p>
      ) : (
        <ul className={styles.list}>
          {revisions.map((revision, index) => (
            <RevisionRow
              key={revision.id}
              entityType={entityType}
              entityId={entityId}
              revision={revision}
              isCurrent={index === 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
