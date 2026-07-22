"use client";

import { LayoutDashboardIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBodyThemeClass } from "@/lib/use-body-theme-class";
import { ThemeToggle } from "@/components/theme-toggle";
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
  useBodyThemeClass("theme-admin");

  return (
    <main className={`theme-admin ${styles.page}`}>
      <ThemeToggle className={styles.themeToggle} iconClassName={styles.themeToggleIcon} />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.frame}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>
            <LayoutDashboardIcon className={styles.badgeIcon} />
          </span>
        </div>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle className={styles.title}>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        <p className={styles.wordmark}>Portfolio Admin</p>
      </div>
    </main>
  );
}
