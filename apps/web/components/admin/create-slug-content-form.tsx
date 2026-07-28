"use client";

import { useActionState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./create-slug-content-form.module.scss";

export interface CreateSlugContentState {
  error?: string;
}

const initialState: CreateSlugContentState = {};

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
        {/* "en" is the only value the Locale enum accepts today — read-only
            rather than a free-text input an admin could mistype into an
            invalid value (the server action validates this too, but there's
            no reason to let the mistake happen in the first place). */}
        <Input id="locale" name="locale" required defaultValue="en" readOnly className={styles.localeInput} />
      </div>
      <div className={styles.field}>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
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
