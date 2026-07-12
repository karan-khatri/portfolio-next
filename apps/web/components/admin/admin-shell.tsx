"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboardIcon, FileTextIcon, LogOutIcon } from "lucide-react";
import styles from "./admin-shell.module.scss";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/pages", label: "Pages", icon: FileTextIcon },
];

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.wordmark}>Portfolio Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active || undefined}
                className={styles.navLink}
                title={item.label}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.userEmail} title={userEmail}>
            {userEmail}
          </span>
          <button type="button" onClick={handleSignOut} className={styles.signOutButton}>
            <LogOutIcon className={styles.navIcon} />
            <span className={styles.navLabel}>Sign out</span>
          </button>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
