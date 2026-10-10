"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LuLayoutDashboard,
  LuFileText,
  LuFolderKanban,
  LuNewspaper,
  LuWandSparkles,
  LuImage,
  LuUser,
  LuMail,
  LuBriefcase,
  LuGraduationCap,
  LuSparkles,
  LuLanguages,
  LuBoxes,
  LuWrench,
  LuQuote,
  LuLink,
  LuArrowRightLeft,
  LuSettings,
  LuUsers,
  LuFileJson,
  LuLogOut,
} from "react-icons/lu";
import { initialsFromEmail } from "@/lib/admin/initials";
import { useBodyThemeClass } from "@/lib/use-body-theme-class";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./admin-shell.module.scss";

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LuLayoutDashboard },
      { href: "/admin/pages", label: "Pages", icon: LuFileText },
      { href: "/admin/projects", label: "Projects", icon: LuFolderKanban },
      { href: "/admin/posts", label: "Posts", icon: LuNewspaper },
      { href: "/admin/ai-blog", label: "AI Blog Generator", icon: LuWandSparkles },
      { href: "/admin/authors", label: "Authors", icon: LuUser },
      { href: "/admin/media", label: "Media", icon: LuImage },
      { href: "/admin/messages", label: "Messages", icon: LuMail },
    ],
  },
  {
    label: "Profile",
    items: [
      { href: "/admin/experience", label: "Experience", icon: LuBriefcase },
      { href: "/admin/education", label: "Education", icon: LuGraduationCap },
      { href: "/admin/skills", label: "Skills", icon: LuSparkles },
      { href: "/admin/languages", label: "Languages", icon: LuLanguages },
      { href: "/admin/tech-stack", label: "Tech Stack", icon: LuBoxes },
      { href: "/admin/services", label: "Services", icon: LuWrench },
      { href: "/admin/testimonials", label: "Testimonials", icon: LuQuote },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/navigation", label: "Navigation", icon: LuLink },
      { href: "/admin/redirects", label: "Redirects", icon: LuArrowRightLeft },
      { href: "/admin/settings", label: "Settings", icon: LuSettings },
      { href: "/admin/users", label: "Users", icon: LuUsers },
      { href: "/admin/seed", label: "Import / Seed", icon: LuFileJson },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  useBodyThemeClass("theme-admin");

  const currentLabel =
    [...ALL_NAV_ITEMS]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => (item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href)))
      ?.label ?? "Portfolio Admin";

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className={`theme-admin ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logoMark}>P</span>
          <span className={styles.wordmark}>Portfolio Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <span className={styles.navGroupLabel}>{group.label}</span>
              {group.items.map((item) => {
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
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.userEmail} title={userEmail}>
            {userEmail}
          </span>
          <button type="button" onClick={handleSignOut} className={styles.signOutButton}>
            <LuLogOut className={styles.navIcon} />
            <span className={styles.navLabel}>Sign out</span>
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarTitle}>{currentLabel}</span>
          <div className={styles.topbarActions}>
            <ThemeToggle className={styles.iconButton} iconClassName={styles.topbarIcon} />
            <span className={styles.avatar} title={userEmail}>
              {initialsFromEmail(userEmail)}
            </span>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
