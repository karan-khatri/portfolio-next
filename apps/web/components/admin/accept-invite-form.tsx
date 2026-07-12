"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponseBody } from "@/lib/api/response";

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const response = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setSubmitting(false);

    const body: ApiResponseBody<{ email: string; role: string }> = await response.json();
    if (!body.success) {
      toast.error(body.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">Choose a password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? <Loader2Icon className="animate-spin" /> : null}
        {submitting ? "Setting up…" : "Set password & sign in"}
      </Button>
    </form>
  );
}
