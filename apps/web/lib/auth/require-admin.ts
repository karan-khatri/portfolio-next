import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role) {
    redirect("/admin/login");
  }
  return user;
}

export async function requireEditor() {
  const user = await getCurrentUser();
  if (!user || !user.role) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdminRole() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return user;
}
