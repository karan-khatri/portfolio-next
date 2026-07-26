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
import { MediaUrlField } from "@/components/admin/media-url-field";
import { saveSiteSettingsAction } from "@/app/admin/(protected)/settings/actions";
import type { SiteSettingsValues } from "@portfolio/db/server";
import styles from "./site-settings-form.module.scss";

export function SiteSettingsForm({ initial }: { initial: SiteSettingsValues }) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [githubUrl, setGithubUrl] = useState(initial.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl ?? "");
  const [upworkUrl, setUpworkUrl] = useState(initial.upworkUrl ?? "");
  const [fiverrUrl, setFiverrUrl] = useState(initial.fiverrUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl ?? "");
  const [resumeUrl, setResumeUrl] = useState(initial.resumeUrl ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [pending, startTransition] = useTransition();

  function handleReset() {
    setTitle(initial.title);
    setDescription(initial.description);
    setGithubUrl(initial.githubUrl ?? "");
    setLinkedinUrl(initial.linkedinUrl ?? "");
    setUpworkUrl(initial.upworkUrl ?? "");
    setFiverrUrl(initial.fiverrUrl ?? "");
    setInstagramUrl(initial.instagramUrl ?? "");
    setResumeUrl(initial.resumeUrl ?? "");
    setLocation(initial.location ?? "");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSiteSettingsAction({
        title,
        description,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        upworkUrl: upworkUrl || null,
        fiverrUrl: fiverrUrl || null,
        instagramUrl: instagramUrl || null,
        resumeUrl: resumeUrl || null,
        location: location || null,
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
        <div className={styles.field}>
          <Label htmlFor="site-location">Location</Label>
          <div className={styles.inputWrap}>
            <LuMapPin className={styles.inputIcon} />
            <Input
              id="site-location"
              placeholder="Florence (Firenze), Italy"
              className={styles.inputWithIcon}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
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
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
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
              value={linkedinUrl}
              onChange={(event) => setLinkedinUrl(event.target.value)}
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
              value={upworkUrl}
              onChange={(event) => setUpworkUrl(event.target.value)}
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
              value={fiverrUrl}
              onChange={(event) => setFiverrUrl(event.target.value)}
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
              value={instagramUrl}
              onChange={(event) => setInstagramUrl(event.target.value)}
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
            icon={<LuFileText />}
          />
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
