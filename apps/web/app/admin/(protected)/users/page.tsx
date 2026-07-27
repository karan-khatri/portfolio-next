import { redirect } from "next/navigation";
import { prisma, getActiveRoleAssignment } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import styles from "./page.module.scss";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  const items = await Promise.all(
    users.map(async (user) => {
      const active = await getActiveRoleAssignment(user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        activeRole:
          active && active.role
            ? { assignmentId: active.id, name: active.role.name, expiresAt: active.expiresAt }
            : null,
      };
    }),
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Users</h1>
      <UserRoleManager
        users={items}
        roles={roles.map((role) => ({ id: role.id, name: role.name, isPermanent: role.isPermanent }))}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
