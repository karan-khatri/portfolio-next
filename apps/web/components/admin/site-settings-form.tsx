"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { LuLoaderCircle, LuFileText, LuMapPin, LuSave } from "react-icons/lu";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiUpwork, SiFiverr, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { saveSiteSettingsAction } from "@/app/admin/(protected)/settings/actions";
import type { SiteSettingsValues } from "@/lib/admin/view-models";
import styles from "./site-settings-form.module.scss";

interface FormValues {
  title: string;
  description: string;
  githubUrl: string;
  linkedinUrl: string;
  upworkUrl: string;
  fiverrUrl: string;
  instagramUrl: string;
  resumeUrl: string;
  location: string;
  contactAutoReplyEnabled: boolean;
  contactAutoReplySubject: string;
  contactAutoReplyBody: string;
}

function toFormValues(initial: SiteSettingsValues): FormValues {
  return {
    title: initial.title,
    description: initial.description,
    githubUrl: initial.githubUrl ?? "",
    linkedinUrl: initial.linkedinUrl ?? "",
    upworkUrl: initial.upworkUrl ?? "",
    fiverrUrl: initial.fiverrUrl ?? "",
    instagramUrl: initial.instagramUrl ?? "",
    resumeUrl: initial.resumeUrl ?? "",
    location: initial.location ?? "",
    contactAutoReplyEnabled: initial.contactAutoReplyEnabled,
    contactAutoReplySubject: initial.contactAutoReplySubject,
    contactAutoReplyBody: initial.contactAutoReplyBody,
  };
}

export function SiteSettingsForm({ initial }: { initial: SiteSettingsValues }) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initial));
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setValues(toFormValues(initial));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSiteSettingsAction({
        title: values.title,
        description: values.description,
        githubUrl: values.githubUrl || null,
        linkedinUrl: values.linkedinUrl || null,
        upworkUrl: values.upworkUrl || null,
        fiverrUrl: values.fiverrUrl || null,
        instagramUrl: values.instagramUrl || null,
        resumeUrl: values.resumeUrl || null,
        location: values.location || null,
        contactAutoReplyEnabled: values.contactAutoReplyEnabled,
        contactAutoReplySubject: values.contactAutoReplySubject,
        contactAutoReplyBody: values.contactAutoReplyBody,
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
          <Input id="site-title" value={values.title} onChange={(event) => setField("title", event.target.value)} />
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-description">Site description</Label>
          <Textarea
            id="site-description"
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-location">Location</Label>
          <div className={styles.inputWrap}>
            <LuMapPin className={styles.inputIcon} />
            <Input
              id="site-location"
              placeholder="Florence (Firenze), Italy"
              className={styles.inputWithIcon}
              value={values.location}
              onChange={(event) => setField("location", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>External Links</h2>
        <div className={styles.field}>
          <Label htmlFor="site-github">GitHub URL</Label>
          <div className={styles.inputWrap}>
            <FaGithub className={styles.inputIcon} />
            <Input
              id="site-github"
              type="url"
              placeholder="https://github.com/your-username"
              className={styles.inputWithIcon}
              value={values.githubUrl}
              onChange={(event) => setField("githubUrl", event.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-linkedin">LinkedIn URL</Label>
          <div className={styles.inputWrap}>
            <FaLinkedin className={styles.inputIcon} />
            <Input
              id="site-linkedin"
              type="url"
              placeholder="https://linkedin.com/in/your-username"
              className={styles.inputWithIcon}
              value={values.linkedinUrl}
              onChange={(event) => setField("linkedinUrl", event.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-upwork">Upwork URL</Label>
          <div className={styles.inputWrap}>
            <SiUpwork className={styles.inputIcon} />
            <Input
              id="site-upwork"
              type="url"
              placeholder="https://upwork.com/freelancers/your-profile"
              className={styles.inputWithIcon}
              value={values.upworkUrl}
              onChange={(event) => setField("upworkUrl", event.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-fiverr">Fiverr URL</Label>
          <div className={styles.inputWrap}>
            <SiFiverr className={styles.inputIcon} />
            <Input
              id="site-fiverr"
              type="url"
              placeholder="https://fiverr.com/your-username"
              className={styles.inputWithIcon}
              value={values.fiverrUrl}
              onChange={(event) => setField("fiverrUrl", event.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-instagram">Instagram URL</Label>
          <div className={styles.inputWrap}>
            <SiInstagram className={styles.inputIcon} />
            <Input
              id="site-instagram"
              type="url"
              placeholder="https://instagram.com/your-username"
              className={styles.inputWithIcon}
              value={values.instagramUrl}
              onChange={(event) => setField("instagramUrl", event.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-resume">Resume URL</Label>
          <MediaUrlField
            id="site-resume"
            value={values.resumeUrl}
            onChange={(value) => setField("resumeUrl", value)}
            placeholder="Link to a hosted PDF, or browse Media"
            icon={<LuFileText />}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Form Auto-Reply</h2>
        <div className={styles.field}>
          <div className={styles.switchRow}>
            <Switch
              id="site-autoreply-enabled"
              checked={values.contactAutoReplyEnabled}
              onCheckedChange={(checked) => setField("contactAutoReplyEnabled", checked)}
            />
            <Label htmlFor="site-autoreply-enabled">
              Send an automatic reply to whoever submits the contact form
            </Label>
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-autoreply-subject">Subject</Label>
          <Input
            id="site-autoreply-subject"
            value={values.contactAutoReplySubject}
            onChange={(event) => setField("contactAutoReplySubject", event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-autoreply-body">Body</Label>
          <Textarea
            id="site-autoreply-body"
            rows={6}
            value={values.contactAutoReplyBody}
            onChange={(event) => setField("contactAutoReplyBody", event.target.value)}
          />
          <p className={styles.hint}>
            Use <code>{"{{name}}"}</code> anywhere in the subject or body to insert the sender&rsquo;s name.
          </p>
        </div>
      </section>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={handleReset} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <LuLoaderCircle className={styles.spinner} /> : <LuSave />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
