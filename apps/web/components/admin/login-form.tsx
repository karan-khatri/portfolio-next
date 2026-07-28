"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { LuArrowRight, LuLoaderCircle, LuLock, LuMail } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/admin/login/actions";
import styles from "./login-form.module.scss";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await loginAction(email, password);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="email">Email</Label>
        <div className={styles.inputWrap}>
          <LuMail className={styles.inputIcon} />
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
          <LuLock className={styles.inputIcon} />
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
      <Button type="submit" disabled={pending} className={styles.submit}>
        {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
        {pending ? "Signing in…" : "Sign in"}
        {!pending ? <LuArrowRight className={styles.submitIcon} /> : null}
      </Button>
    </form>
  );
}
