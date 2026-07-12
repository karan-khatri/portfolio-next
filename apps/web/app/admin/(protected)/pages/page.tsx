import Link from "next/link";
import { prisma } from "@portfolio/db/server";
import { CreatePageForm } from "@/components/admin/create-page-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPagesListPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Pages</h1>

      <Card>
        <CardContent>
          <ul className="divide-y">
            {pages.map((page) => (
              <li key={page.id}>
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="flex items-center justify-between gap-4 py-3 text-sm hover:opacity-80"
                >
                  <span>
                    <span className="font-medium">{page.title}</span>{" "}
                    <span className="text-muted-foreground">
                      {page.slug}/{page.locale}
                    </span>
                  </span>
                  <StatusBadge status={page.status} />
                </Link>
              </li>
            ))}
            {pages.length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">No pages yet.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New page</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePageForm />
        </CardContent>
      </Card>
    </div>
  );
}
