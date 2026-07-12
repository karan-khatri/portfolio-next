"use client";

import { useActionState } from "react";
import { Loader2Icon } from "lucide-react";
import { createPageAction, type CreatePageState } from "@/app/admin/(protected)/pages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreatePageState = {};

export function CreatePageForm() {
  const [state, formAction, pending] = useActionState(createPageAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required placeholder="home" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="locale">Locale</Label>
        <Input id="locale" name="locale" required defaultValue="en" className="w-20" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" /> : null}
        {pending ? "Creating…" : "Create page"}
      </Button>
      {state.error ? (
        <p role="alert" className="w-full text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
