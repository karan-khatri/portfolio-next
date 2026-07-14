"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRightIcon, Loader2Icon, LockIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponseBody } from "@/lib/api/response";
import styles from "./login-form.module.scss";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="email">Email</Label>
        <div className={styles.inputWrap}>
          <MailIcon className={styles.inputIcon} />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={styles.inputWithIcon}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>
      <div className={styles.field}>
        <Label htmlFor="password">Password</Label>
        <div className={styles.inputWrap}>
          <LockIcon className={styles.inputIcon} />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className={styles.inputWithIcon}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={submitting} className={styles.submit}>
        {submitting ? <Loader2Icon className={styles.spinner} /> : null}
        {submitting ? "Signing in…" : "Sign in"}
        {!submitting ? <ArrowRightIcon className={styles.submitIcon} /> : null}
      </Button>
    </form>
  );
}
