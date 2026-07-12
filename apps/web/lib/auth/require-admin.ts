import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

// The deeper, DB-verified half of the admin auth-gate (see proxy.ts for the
// cheap edge-side half). Called from app/admin/layout.tsx so every admin
// route — present and future — is covered without each page opting in.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
