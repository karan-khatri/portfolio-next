"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
}: {
  entityType: EntityType;
  entityId: string;
  revision: RevisionHistoryItem;
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
    <li className={styles.row}>
      <span className={styles.rowMain}>
        <StatusBadge status={revision.status} />
        <span className={styles.meta}>
          <time dateTime={revision.createdAt.toISOString()}>
            {formatRelativeTime(revision.createdAt)}
          </time>
          {revision.createdByEmail ? ` · by ${revision.createdByEmail}` : null}
        </span>
      </span>
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleRestore}>
        {pending ? <Loader2Icon className={styles.spinner} /> : null}
        Restore
      </Button>
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
    <details className={styles.disclosure}>
      <summary className={styles.trigger}>History ({revisions.length})</summary>
      <Card className={styles.card}>
        <CardContent>
          {revisions.length === 0 ? (
            <p className={styles.empty}>No revisions yet.</p>
          ) : (
            <ul className={styles.list}>
              {revisions.map((revision) => (
                <RevisionRow
                  key={revision.id}
                  entityType={entityType}
                  entityId={entityId}
                  revision={revision}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </details>
  );
}
