"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInviteAction } from "@/app/admin/accept-invite/[token]/actions";
import styles from "./accept-invite-form.module.scss";

export function AcceptInviteForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await acceptInviteAction(token, password);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
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
      <Button type="submit" disabled={pending} className={styles.submit}>
        {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
        {pending ? "Setting up…" : "Set password & sign in"}
      </Button>
    </form>
  );
}
