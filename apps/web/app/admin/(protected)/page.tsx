import { FileTextIcon, FolderKanbanIcon, NewspaperIcon } from "lucide-react";
import { prisma } from "@portfolio/db/server";
import { InvitesPanel } from "@/components/admin/invites-panel";
import { StatCard } from "@/components/admin/stat-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./page.module.scss";

async function getStatusCounts() {
  const [pages, projects, posts] = await Promise.all([
    prisma.page.groupBy({ by: ["status"], _count: true }),
    prisma.project.groupBy({ by: ["status"], _count: true }),
    prisma.post.groupBy({ by: ["status"], _count: true }),
  ]);
  return { pages, projects, posts };
}

async function getRecentActivity() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    include: { user: { select: { email: true } } },
  });
}

async function getPendingInvites() {
  return prisma.inviteToken.findMany({
    where: { acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    include: { invitedBy: { select: { email: true } }, role: true },
  });
}

async function getRoles() {
  return prisma.role.findMany({ orderBy: { name: "asc" } });
}

export default async function AdminDashboardPage() {
  const [{ pages, projects, posts }, activity, invites, roles] = await Promise.all([
    getStatusCounts(),
    getRecentActivity(),
    getPendingInvites(),
    getRoles(),
  ]);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>

      <section aria-labelledby="content-status-heading" className={styles.section}>
        <h2 id="content-status-heading" className={styles.sectionLabel}>
          Content status
        </h2>
        <div className={styles.statGrid}>
          <StatCard title="Pages" icon={FileTextIcon} counts={pages} href="/admin/pages" />
          <StatCard title="Projects" icon={FolderKanbanIcon} counts={projects} href="/admin/pages" />
          <StatCard title="Posts" icon={NewspaperIcon} counts={posts} href="/admin/pages" />
        </div>
      </section>

      <section aria-labelledby="activity-heading" className={styles.section}>
        <h2 id="activity-heading" className={styles.sectionLabel}>
          Recent activity
        </h2>
        <Card>
          <CardContent>
            <ActivityFeed activity={activity} />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="invites-heading" className={styles.section}>
        <h2 id="invites-heading" className={styles.sectionLabel}>
          Invites
        </h2>
        <Card>
          <CardContent>
            <InvitesPanel pendingInvites={invites} roles={roles} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
