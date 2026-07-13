import { notFound, permanentRedirect, redirect } from "next/navigation";
import { prisma } from "@portfolio/db/server";

// Only reached for paths that don't match any more-specific route (admin/,
// api/, preview/, and / all take priority automatically). Node runtime, so
// it can query Postgres directly — unlike proxy.ts, which is edge-only.
export default async function CatchAllRedirectPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const fromPath = `/${slug.join("/")}`;

  const match = await prisma.redirect.findUnique({ where: { fromPath } });
  if (!match) notFound();

  if (match.statusCode === 308) {
    permanentRedirect(match.toPath);
  } else {
    redirect(match.toPath);
  }
}
