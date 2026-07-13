"use client";

import { useActionState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./create-slug-content-form.module.scss";

export interface CreateSlugContentState {
  error?: string;
}

const initialState: CreateSlugContentState = {};

// Shared by Page/Project/Post — all three need the identical
// slug+locale+title creation form, differing only in which server action
// they call and the submit button's label.
export function CreateSlugContentForm({
  action,
  submitLabel,
  slugPlaceholder,
}: {
  action: (
    prevState: CreateSlugContentState,
    formData: FormData,
  ) => Promise<CreateSlugContentState>;
  submitLabel: string;
  slugPlaceholder?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required placeholder={slugPlaceholder} />
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
        {pending ? "Creating…" : submitLabel}
      </Button>
      {state.error ? (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
