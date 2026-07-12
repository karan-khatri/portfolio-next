"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopyIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import type { ApiResponseBody } from "@/lib/api/response";
import styles from "./invites-panel.module.scss";

interface RoleOption {
  id: string;
  name: string;
  isPermanent: boolean;
}

interface PendingInvite {
  token: string;
  email: string;
  role: { name: string };
  roleExpiresAt: Date | null;
  expiresAt: Date;
  invitedBy: { email: string };
}

const DEFAULT_EXPIRES_IN_DAYS = 30;

export function InvitesPanel({
  pendingInvites,
  roles,
}: {
  pendingInvites: PendingInvite[];
  roles: RoleOption[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [expiresInDays, setExpiresInDays] = useState(String(DEFAULT_EXPIRES_IN_DAYS));
  const [submitting, setSubmitting] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

  const selectedRole = roles.find((r) => r.id === roleId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setLastInviteLink(null);

    const response = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        roleId,
        expiresInDays: selectedRole?.isPermanent ? null : Number(expiresInDays),
      }),
    });

    setSubmitting(false);

    const body: ApiResponseBody<{ token: string; expiresAt: string }> = await response.json();
    if (!body.success) {
      toast.error(body.message);
      return;
    }

    setLastInviteLink(`${window.location.origin}/admin/accept-invite/${body.data.token}`);
    setEmail("");
    toast.success(body.message);
    router.refresh();
  }

  function copyInviteLink() {
    if (!lastInviteLink) return;
    navigator.clipboard.writeText(lastInviteLink);
    toast.success("Copied invite link");
  }

  return (
    <div className={styles.panel}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="invite-role">Role</Label>
          <Select value={roleId} onValueChange={(value) => setRoleId(value ?? "")}>
            <SelectTrigger id="invite-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedRole && !selectedRole.isPermanent ? (
          <div className={styles.field}>
            <Label htmlFor="invite-expires">Expires in (days)</Label>
            <Input
              id="invite-expires"
              type="number"
              min={1}
              required
              value={expiresInDays}
              onChange={(event) => setExpiresInDays(event.target.value)}
              className={styles.expiresInput}
            />
          </div>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2Icon className={styles.spinner} /> : null}
          {submitting ? "Sending…" : "Send invite"}
        </Button>
      </form>

      {lastInviteLink ? (
        <div className={styles.linkBox}>
          <span className={styles.linkText}>{lastInviteLink}</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={copyInviteLink}>
            <CopyIcon />
          </Button>
        </div>
      ) : null}

      <ul className={styles.list}>
        {pendingInvites.map((invite) => (
          <li key={invite.token} className={styles.row}>
            <span className={styles.rowMain}>
              <span className={styles.email}>{invite.email}</span>
              <span className={styles.meta}>
                invited by {invite.invitedBy.email}
                {invite.roleExpiresAt
                  ? `, role expires ${formatRelativeTime(invite.roleExpiresAt)}`
                  : ""}
                , invite link expires {formatRelativeTime(invite.expiresAt)}
              </span>
            </span>
            <Badge variant="outline" className={styles.roleBadge}>
              {invite.role.name}
            </Badge>
          </li>
        ))}
        {pendingInvites.length === 0 ? <li className={styles.empty}>No pending invites.</li> : null}
      </ul>
    </div>
  );
}
