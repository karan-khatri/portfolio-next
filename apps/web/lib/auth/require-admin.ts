import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

// The deeper, DB-verified half of the admin auth-gate (see proxy.ts for the
// cheap edge-side half). Called from app/admin/layout.tsx so every admin
// route — present and future — is covered without each page opting in.
//
// `user.role` is resolved fresh on every call (see getCurrentUser ->
// verifySessionToken -> getActiveRoleAssignment) rather than cached, so a
// timed role grant expiring takes effect on the very next request — no
// separate session invalidation needed. A session can be valid while the
// user has no active role (grant expired); that still fails closed here.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role) {
    redirect("/admin/login");
  }
  return user;
}
