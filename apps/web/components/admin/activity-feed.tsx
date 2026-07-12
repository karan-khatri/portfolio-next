import { getAuditActionIcon } from "@/lib/admin/audit-action-icons";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import styles from "./activity-feed.module.scss";

interface ActivityRow {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: Date;
  user: { email: string };
}

export function ActivityFeed({ activity }: { activity: ActivityRow[] }) {
  if (activity.length === 0) {
    return <p className={styles.empty}>No activity yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {activity.map((row) => {
        const Icon = getAuditActionIcon(row.action);
        return (
          <li key={row.id} className={styles.row}>
            <span className={styles.iconWrap}>
              <Icon className={styles.icon} />
            </span>
            <span className={styles.body}>
              <span className={styles.primary}>
                <span className={styles.user}>{row.user.email}</span>{" "}
                <span className={styles.action}>
                  {row.action} · {row.entity}:{row.entityId.slice(0, 8)}
                </span>
              </span>
              <span className={styles.time} title={row.createdAt.toLocaleString()}>
                {formatRelativeTime(row.createdAt)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
