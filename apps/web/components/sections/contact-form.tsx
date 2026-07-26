"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { LuSend, LuUser, LuAtSign, LuMessageSquare, LuLock } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitContactMessageAction } from "./contact-actions";

const INITIAL_VALUES = { name: "", email: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await submitContactMessageAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Message sent — thanks for reaching out.");
      setValues(INITIAL_VALUES);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel w-full rounded-2xl border border-border/60 bg-card/30 p-6 text-left shadow-2xl shadow-black/20 sm:p-8 lg:p-9"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-xl font-semibold sm:text-2xl">Send a message</h3>
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            secure channel: <span className="text-primary">encrypted</span>
          </p>
        </div>
        <div className="mt-1.5 flex shrink-0 items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="size-1.5 rounded-full bg-primary/60" />
          <span className="size-1.5 rounded-full bg-primary/30" />
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-sm">
            Name
          </Label>
          <div className="relative">
            <LuUser className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-name"
              placeholder="Your name"
              required
              value={values.name}
              className="h-12 pl-10.5 text-base"
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-sm">
            Email
          </Label>
          <div className="relative">
            <LuAtSign className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="contact-email"
              type="email"
              placeholder="Your email"
              required
              value={values.email}
              className="h-12 pl-10.5 text-base"
              onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-message" className="text-sm">
            Message
          </Label>
          <div className="relative">
            <LuMessageSquare className="pointer-events-none absolute top-4 left-3.5 size-4 text-muted-foreground" />
            <Textarea
              id="contact-message"
              required
              placeholder="Your message"
              rows={7}
              value={values.message}
              className="min-h-40 pl-10.5 text-base leading-relaxed"
              onChange={(event) => setValues((prev) => ({ ...prev, message: event.target.value }))}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="mt-6 h-12 w-full font-heading text-sm font-semibold tracking-widest uppercase"
      >
        {pending ? "Sending…" : "Send message"}
        <LuSend />
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[10px] tracking-wide text-muted-foreground/70">
        <LuLock className="size-3" />
        your message is handled securely
      </p>
    </form>
  );
}
