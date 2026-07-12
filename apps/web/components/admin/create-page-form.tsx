"use client";

import { useActionState } from "react";
import { Loader2Icon } from "lucide-react";
import { createPageAction, type CreatePageState } from "@/app/admin/(protected)/pages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./create-page-form.module.scss";

const initialState: CreatePageState = {};

export function CreatePageForm() {
  const [state, formAction, pending] = useActionState(createPageAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required placeholder="home" />
      </div>
      <div className={styles.field}>
        <Label htmlFor="locale">Locale</Label>
        <Input id="locale" name="locale" required defaultValue="en" className={styles.localeInput} />
      </div>
      <div className={styles.field}>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2Icon className={styles.spinner} /> : null}
        {pending ? "Creating…" : "Create page"}
      </Button>
      {state.error ? (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
