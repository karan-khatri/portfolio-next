import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import styles from "./auth-shell.module.scss";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <div className={styles.wordmarkRow}>
          <span className={styles.wordmark}>Portfolio Admin</span>
        </div>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle className={styles.title}>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
