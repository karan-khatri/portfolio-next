"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopyIcon, Loader2Icon } from "lucide-react";
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
import type { ApiResponseBody } from "@/lib/api/response";

interface PendingInvite {
  token: string;
  email: string;
  role: string;
  expiresAt: Date;
  invitedBy: { email: string };
}

export function InvitesPanel({ pendingInvites }: { pendingInvites: PendingInvite[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EDITOR">("EDITOR");
  const [submitting, setSubmitting] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setLastInviteLink(null);

    const response = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as "ADMIN" | "EDITOR")}>
            <SelectTrigger id="invite-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EDITOR">Editor</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2Icon className="animate-spin" /> : null}
          {submitting ? "Sending…" : "Send invite"}
        </Button>
      </form>

      {lastInviteLink ? (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2 text-sm">
          <span className="truncate">{lastInviteLink}</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={copyInviteLink}>
            <CopyIcon />
          </Button>
        </div>
      ) : null}

      <ul className="divide-y">
        {pendingInvites.map((invite) => (
          <li key={invite.token} className="flex items-center justify-between gap-4 py-2 text-sm">
            <span>
              <span className="font-medium">{invite.email}</span>{" "}
              <span className="text-muted-foreground">
                invited by {invite.invitedBy.email}, expires{" "}
                {invite.expiresAt.toLocaleDateString()}
              </span>
            </span>
            <StatusBadge status={invite.role} />
          </li>
        ))}
        {pendingInvites.length === 0 ? (
          <li className="py-2 text-sm text-muted-foreground">No pending invites.</li>
        ) : null}
      </ul>
    </div>
  );
}
