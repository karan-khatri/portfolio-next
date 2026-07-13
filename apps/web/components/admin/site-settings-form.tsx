"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSiteSettingsAction } from "@/app/admin/(protected)/settings/actions";
import type { SiteSettingsValues } from "@portfolio/db/server";
import styles from "./site-settings-form.module.scss";

export function SiteSettingsForm({ initial }: { initial: SiteSettingsValues }) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [githubUrl, setGithubUrl] = useState(initial.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl ?? "");
  const [resumeUrl, setResumeUrl] = useState(initial.resumeUrl ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSiteSettingsAction({
        title,
        description,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        resumeUrl: resumeUrl || null,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Settings saved");
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="site-title">Site title</Label>
        <Input id="site-title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className={styles.field}>
        <Label htmlFor="site-description">Site description</Label>
        <Textarea
          id="site-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Label htmlFor="site-github">GitHub URL</Label>
        <Input
          id="site-github"
          type="url"
          placeholder="https://github.com/your-username"
          value={githubUrl}
          onChange={(event) => setGithubUrl(event.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Label htmlFor="site-linkedin">LinkedIn URL</Label>
        <Input
          id="site-linkedin"
          type="url"
          placeholder="https://linkedin.com/in/your-username"
          value={linkedinUrl}
          onChange={(event) => setLinkedinUrl(event.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Label htmlFor="site-resume">Resume URL</Label>
        <Input
          id="site-resume"
          type="url"
          placeholder="Link to a hosted PDF, or upload one via Media"
          value={resumeUrl}
          onChange={(event) => setResumeUrl(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending} className={styles.saveButton}>
        {pending ? <Loader2Icon className={styles.spinner} /> : null}
        Save
      </Button>
    </form>
  );
}
