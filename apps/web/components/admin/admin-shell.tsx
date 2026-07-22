"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  FolderKanbanIcon,
  NewspaperIcon,
  ImageIcon,
  UserIcon,
  BriefcaseIcon,
  SparklesIcon,
  WrenchIcon,
  QuoteIcon,
  LinkIcon,
  ArrowRightLeftIcon,
  SettingsIcon,
  UsersIcon,
  LogOutIcon,
  SearchIcon,
  BellIcon,
  HelpCircleIcon,
} from "lucide-react";
import { initialsFromEmail } from "@/lib/admin/initials";
import { useBodyThemeClass } from "@/lib/use-body-theme-class";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./admin-shell.module.scss";

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/admin/pages", label: "Pages", icon: FileTextIcon },
      { href: "/admin/projects", label: "Projects", icon: FolderKanbanIcon },
      { href: "/admin/posts", label: "Posts", icon: NewspaperIcon },
      { href: "/admin/authors", label: "Authors", icon: UserIcon },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
    ],
  },
  {
    label: "Profile",
    items: [
      { href: "/admin/experience", label: "Experience", icon: BriefcaseIcon },
      { href: "/admin/skills", label: "Skills", icon: SparklesIcon },
      { href: "/admin/services", label: "Services", icon: WrenchIcon },
      { href: "/admin/testimonials", label: "Testimonials", icon: QuoteIcon },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/navigation", label: "Navigation", icon: LinkIcon },
      { href: "/admin/redirects", label: "Redirects", icon: ArrowRightLeftIcon },
      { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
      { href: "/admin/users", label: "Users", icon: UsersIcon },
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
            <LogOutIcon className={styles.navIcon} />
            <span className={styles.navLabel}>Sign out</span>
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarTitle}>{currentLabel}</span>
          <div className={styles.topbarActions}>
            <div className={styles.searchWrap}>
              <SearchIcon className={styles.searchIcon} />
              <input className={styles.searchInput} placeholder="Search…" type="text" readOnly />
            </div>
            <ThemeToggle className={styles.iconButton} iconClassName={styles.topbarIcon} />
            <button type="button" className={styles.iconButton} aria-label="Notifications">
              <BellIcon className={styles.topbarIcon} />
              <span className={styles.iconDot} aria-hidden="true" />
            </button>
            <button type="button" className={styles.iconButton} aria-label="Help">
              <HelpCircleIcon className={styles.topbarIcon} />
            </button>
            <button type="button" className={styles.publishButton}>
              Publish Changes
            </button>
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
