import Link from "next/link";
import type { IconType } from "react-icons";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import styles from "./stat-card.module.scss";

interface StatusCount {
  status: string;
  _count: number;
}

export function StatCard({
  title,
  icon: Icon,
  counts,
  href,
}: {
  title: string;
  icon: IconType;
  counts: StatusCount[];
  href: string;
}) {
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <Link href={href} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Icon className={styles.icon} />
            <span className={styles.title}>{title}</span>
          </div>
          <span className={styles.count}>{total}</span>
        </div>

        {counts.length === 0 ? (
          <span className={styles.empty}>Nothing yet</span>
        ) : (
          <>
            <div className={styles.breakdown}>
              {counts.map((c) => (
                <span
                  key={c.status}
                  className={styles.segment}
                  data-status={c.status.toLowerCase()}
                  style={{ flexGrow: c._count }}
                />
              ))}
            </div>
            <div className={styles.legend}>
              {counts.map((c) => (
                <StatusBadge key={c.status} status={c.status} count={c._count} />
              ))}
            </div>
          </>
        )}
      </Card>
    </Link>
  );
}
