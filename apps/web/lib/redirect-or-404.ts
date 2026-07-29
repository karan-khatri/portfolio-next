import { notFound, permanentRedirect, redirect } from "next/navigation";
import { prisma } from "@portfolio/db/server";

// A renamed/removed post, project, or author slug should 301/302 to wherever
// it moved (via an admin-configured Redirect row) instead of just 404ing —
// the [...slug] catch-all already does this for unknown standalone-page
// paths; this covers the same case for entity detail routes.
//
// Synchronous and typed `never` (rather than wrapping the DB lookup inside
// this function as `Promise<never>`) so TypeScript can actually narrow the
// caller's `if (!entity) redirectOrNotFound(match)` as unreachable code
// below it — the same way a plain `notFound()` call already does.
export function redirectOrNotFound(match: { statusCode: number; toPath: string } | null): never {
  if (!match) notFound();

  if (match.statusCode === 308) {
    permanentRedirect(match.toPath);
  } else {
    redirect(match.toPath);
  }
}

export function findRedirect(fromPath: string) {
  return prisma.redirect.findUnique({ where: { fromPath } });
}
