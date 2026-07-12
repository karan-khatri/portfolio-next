import styles from "./status-badge.module.scss";

export function StatusBadge({ status, count }: { status: string; count?: number }) {
  return (
    <span className={styles.badge} data-status={status.toLowerCase()}>
      <span className={styles.dot} aria-hidden="true" />
      {status}
      {typeof count === "number" ? <span className={styles.count}>{count}</span> : null}
    </span>
  );
}
