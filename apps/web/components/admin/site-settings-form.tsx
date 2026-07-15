"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CodeIcon, Loader2Icon, BriefcaseIcon, FileTextIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUrlField } from "@/components/admin/media-url-field";
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

  function handleReset() {
    setTitle(initial.title);
    setDescription(initial.description);
    setGithubUrl(initial.githubUrl ?? "");
    setLinkedinUrl(initial.linkedinUrl ?? "");
    setResumeUrl(initial.resumeUrl ?? "");
  }

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
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Site Identity</h2>
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
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>External Links</h2>
        <div className={styles.field}>
          <Label htmlFor="site-github">GitHub URL</Label>
          <div className={styles.inputWrap}>
            <CodeIcon className={styles.inputIcon} />
            <Input
              id="site-github"
              type="url"
              placeholder="https://github.com/your-username"
              className={styles.inputWithIcon}
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-linkedin">LinkedIn URL</Label>
          <div className={styles.inputWrap}>
            <BriefcaseIcon className={styles.inputIcon} />
            <Input
              id="site-linkedin"
              type="url"
              placeholder="https://linkedin.com/in/your-username"
              className={styles.inputWithIcon}
              value={linkedinUrl}
              onChange={(event) => setLinkedinUrl(event.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-resume">Resume URL</Label>
          <MediaUrlField
            id="site-resume"
            value={resumeUrl}
            onChange={setResumeUrl}
            placeholder="Link to a hosted PDF, or browse Media"
            icon={<FileTextIcon />}
          />
        </div>
      </section>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={handleReset} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className={styles.spinner} /> : <SaveIcon />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
