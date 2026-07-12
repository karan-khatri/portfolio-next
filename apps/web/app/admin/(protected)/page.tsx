import Link from "next/link";
import { prisma } from "@portfolio/db/server";
import { InvitesPanel } from "@/components/admin/invites-panel";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function StatusCard({
  title,
  counts,
  href,
}: {
  title: string;
  counts: { status: string; _count: number }[];
  href: string;
}) {
  const total = counts.reduce((sum, c) => sum + c._count, 0);
  return (
    <Link href={href} className="block transition-opacity hover:opacity-80">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-baseline justify-between">
            <span>{title}</span>
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {counts.length === 0 ? (
            <span className="text-sm text-muted-foreground">Nothing yet</span>
          ) : (
            counts.map((c) => (
              <StatusBadge key={c.status} status={c.status} count={c._count} />
            ))
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [{ pages, projects, posts }, activity, invites, roles] = await Promise.all([
    getStatusCounts(),
    getRecentActivity(),
    getPendingInvites(),
    getRoles(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section aria-labelledby="content-status-heading" className="space-y-3">
        <h2 id="content-status-heading" className="text-sm font-medium text-muted-foreground">
          Content status
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatusCard title="Pages" counts={pages} href="/admin/pages" />
          <StatusCard title="Projects" counts={projects} href="/admin/pages" />
          <StatusCard title="Posts" counts={posts} href="/admin/pages" />
        </div>
      </section>

      <section aria-labelledby="activity-heading" className="space-y-3">
        <h2 id="activity-heading" className="text-sm font-medium text-muted-foreground">
          Recent activity
        </h2>
        <Card>
          <CardContent>
            <ul className="divide-y">
              {activity.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <span>
                    <span className="font-medium">{row.user.email}</span>{" "}
                    <span className="text-muted-foreground">
                      {row.action} · {row.entity}:{row.entityId.slice(0, 8)}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {row.createdAt.toLocaleString()}
                  </span>
                </li>
              ))}
              {activity.length === 0 ? (
                <li className="py-2 text-sm text-muted-foreground">No activity yet.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="invites-heading" className="space-y-3">
        <h2 id="invites-heading" className="text-sm font-medium text-muted-foreground">
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
