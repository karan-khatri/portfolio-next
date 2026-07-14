"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import { initialsFromEmail } from "@/lib/admin/initials";
import { assignRoleAction, revokeRoleAction } from "@/app/admin/(protected)/users/actions";
import styles from "./user-role-manager.module.scss";

const DEFAULT_EXPIRES_IN_DAYS = 30;

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  activeRole: { assignmentId: string; name: string; expiresAt: Date | null } | null;
}

export interface RoleOption {
  id: string;
  name: string;
  isPermanent: boolean;
}

function UserRow({
  user,
  roles,
  isSelf,
}: {
  user: UserRow;
  roles: RoleOption[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [expiresInDays, setExpiresInDays] = useState(String(DEFAULT_EXPIRES_IN_DAYS));
  const [pending, startTransition] = useTransition();

  const selectedRole = roles.find((r) => r.id === roleId);

  function handleAssign(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await assignRoleAction(
        user.id,
        roleId,
        selectedRole?.isPermanent ? null : Number(expiresInDays),
      );
      if (result.error) toast.error(result.error);
      else {
        toast.success("Role assigned");
        router.refresh();
      }
    });
  }

  function handleRevoke() {
    if (!user.activeRole) return;
    startTransition(async () => {
      const result = await revokeRoleAction(user.id, user.activeRole!.assignmentId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Role revoked");
        router.refresh();
      }
    });
  }

  return (
    <details className={styles.itemCard}>
      <summary className={styles.itemSummary}>
        <span className={styles.avatar} aria-hidden="true">
          {initialsFromEmail(user.email)}
        </span>
        <span className={styles.summaryText}>
          <span className={styles.email}>{user.email}</span>
          <span className={styles.meta}>
            {user.activeRole
              ? user.activeRole.expiresAt
                ? `expires ${formatRelativeTime(user.activeRole.expiresAt)}`
                : "permanent"
              : "no active role"}
          </span>
        </span>
        <StatusBadge status={user.activeRole?.name ?? "NONE"} />
      </summary>
      <div className={styles.itemBody}>
        {isSelf ? (
          <p className={styles.selfNotice}>You can&rsquo;t change your own role.</p>
        ) : (
          <>
            <form onSubmit={handleAssign} className={styles.form}>
              <div className={styles.field}>
                <Label htmlFor={`role-${user.id}`}>Assign role</Label>
                <Select value={roleId} onValueChange={(value) => setRoleId(value ?? "")}>
                  <SelectTrigger id={`role-${user.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedRole && !selectedRole.isPermanent ? (
                <div className={styles.field}>
                  <Label htmlFor={`expires-${user.id}`}>Expires in (days)</Label>
                  <Input
                    id={`expires-${user.id}`}
                    type="number"
                    min={1}
                    required
                    value={expiresInDays}
                    onChange={(event) => setExpiresInDays(event.target.value)}
                  />
                </div>
              ) : null}
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? <Loader2Icon className={styles.spinner} /> : null}
                Assign
              </Button>
            </form>
            {user.activeRole ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={handleRevoke}
                className={styles.revokeButton}
              >
                Revoke current role
              </Button>
            ) : null}
          </>
        )}
      </div>
    </details>
  );
}

export function UserRoleManager({
  users,
  roles,
  currentUserId,
}: {
  users: UserRow[];
  roles: RoleOption[];
  currentUserId: string;
}) {
  return (
    <div className={styles.list}>
      {users.map((user) => (
        <UserRow key={user.id} user={user} roles={roles} isSelf={user.id === currentUserId} />
      ))}
    </div>
  );
}
