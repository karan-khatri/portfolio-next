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
import { LocaleSwitch } from "@/components/admin/locale-switch";
import { saveSiteSettingsAction } from "@/app/admin/(protected)/settings/actions";
import type { LocalizedSiteSettingsValues, TranslatableSettingsValues } from "@/lib/admin/view-models";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import styles from "./site-settings-form.module.scss";

interface SharedFormValues {
  githubUrl: string;
  linkedinUrl: string;
  upworkUrl: string;
  fiverrUrl: string;
  instagramUrl: string;
  contactAutoReplyEnabled: boolean;
}

function toSharedValues(initial: LocalizedSiteSettingsValues): SharedFormValues {
  return {
    githubUrl: initial.shared.githubUrl ?? "",
    linkedinUrl: initial.shared.linkedinUrl ?? "",
    upworkUrl: initial.shared.upworkUrl ?? "",
    fiverrUrl: initial.shared.fiverrUrl ?? "",
    instagramUrl: initial.shared.instagramUrl ?? "",
    contactAutoReplyEnabled: initial.shared.contactAutoReplyEnabled,
  };
}

function cloneTranslations(initial: LocalizedSiteSettingsValues): Record<AppLocale, TranslatableSettingsValues> {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...initial.translations[locale] }]),
  ) as Record<AppLocale, TranslatableSettingsValues>;
}

export function SiteSettingsForm({ initial }: { initial: LocalizedSiteSettingsValues }) {
  const [shared, setShared] = useState<SharedFormValues>(() => toSharedValues(initial));
  const [translations, setTranslations] = useState(() => cloneTranslations(initial));
  const [activeLocale, setActiveLocale] = useState<AppLocale>(DEFAULT_LOCALE);
  const [pending, startTransition] = useTransition();

  const current = translations[activeLocale];
  const fallback = translations[DEFAULT_LOCALE];
  const isDefault = activeLocale === DEFAULT_LOCALE;
  const localeName = LOCALE_META[activeLocale].nativeName;

  function setShare<K extends keyof SharedFormValues>(key: K, value: SharedFormValues[K]) {
    setShared((prev) => ({ ...prev, [key]: value }));
  }

  function setTranslated<K extends keyof TranslatableSettingsValues>(key: K, value: string) {
    setTranslations((prev) => ({ ...prev, [activeLocale]: { ...prev[activeLocale], [key]: value } }));
  }

  function placeholderFor(key: keyof TranslatableSettingsValues, base?: string) {
    return isDefault ? base : fallback[key] || base;
  }

  function handleReset() {
    setShared(toSharedValues(initial));
    setTranslations(cloneTranslations(initial));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSiteSettingsAction({
        shared: {
          githubUrl: shared.githubUrl || null,
          linkedinUrl: shared.linkedinUrl || null,
          upworkUrl: shared.upworkUrl || null,
          fiverrUrl: shared.fiverrUrl || null,
          instagramUrl: shared.instagramUrl || null,
          contactAutoReplyEnabled: shared.contactAutoReplyEnabled,
        },
        translations,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Settings saved");
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <LocaleSwitch value={activeLocale} onChange={setActiveLocale} label="Editing language" />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Site Identity · {localeName}</h2>
        <div className={styles.field}>
          <Label htmlFor="site-title">Site title</Label>
          <Input
            id="site-title"
            value={current.title}
            placeholder={placeholderFor("title")}
            onChange={(event) => setTranslated("title", event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-description">Site description</Label>
          <Textarea
            id="site-description"
            value={current.description}
            placeholder={placeholderFor("description")}
            onChange={(event) => setTranslated("description", event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-location">Location</Label>
          <div className={styles.inputWrap}>
            <LuMapPin className={styles.inputIcon} />
            <Input
              id="site-location"
              placeholder={placeholderFor("location", "Florence (Firenze), Italy")}
              className={styles.inputWithIcon}
              value={current.location}
              onChange={(event) => setTranslated("location", event.target.value)}
            />
          </div>
        </div>
        {!isDefault ? (
          <p className={styles.hint}>
            Empty {localeName} fields fall back to the {LOCALE_META[DEFAULT_LOCALE].nativeName} text on the {localeName} site.
          </p>
        ) : null}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>External Links (same in every language)</h2>
        <div className={styles.field}>
          <Label htmlFor="site-github">GitHub URL</Label>
          <div className={styles.inputWrap}>
            <FaGithub className={styles.inputIcon} />
            <Input
              id="site-github"
              type="url"
              placeholder="https://github.com/your-username"
              className={styles.inputWithIcon}
              value={shared.githubUrl}
              onChange={(event) => setShare("githubUrl", event.target.value)}
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
              value={shared.linkedinUrl}
              onChange={(event) => setShare("linkedinUrl", event.target.value)}
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
              value={shared.upworkUrl}
              onChange={(event) => setShare("upworkUrl", event.target.value)}
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
              value={shared.fiverrUrl}
              onChange={(event) => setShare("fiverrUrl", event.target.value)}
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
              value={shared.instagramUrl}
              onChange={(event) => setShare("instagramUrl", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resume · {localeName}</h2>
        <div className={styles.field}>
          <Label htmlFor="site-resume">Resume URL</Label>
          <MediaUrlField
            id="site-resume"
            value={current.resumeUrl}
            onChange={(value) => setTranslated("resumeUrl", value)}
            placeholder={placeholderFor("resumeUrl", "Link to a hosted PDF, or browse Media")}
            icon={<LuFileText />}
          />
          {!isDefault ? (
            <p className={styles.hint}>Leave empty to use the {LOCALE_META[DEFAULT_LOCALE].nativeName} resume.</p>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Form Auto-Reply</h2>
        <div className={styles.field}>
          <div className={styles.switchRow}>
            <Switch
              id="site-autoreply-enabled"
              checked={shared.contactAutoReplyEnabled}
              onCheckedChange={(checked) => setShare("contactAutoReplyEnabled", checked)}
            />
            <Label htmlFor="site-autoreply-enabled">
              Send an automatic reply to whoever submits the contact form
            </Label>
          </div>
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-autoreply-subject">Subject · {localeName}</Label>
          <Input
            id="site-autoreply-subject"
            value={current.contactAutoReplySubject}
            placeholder={placeholderFor("contactAutoReplySubject")}
            onChange={(event) => setTranslated("contactAutoReplySubject", event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="site-autoreply-body">Body · {localeName}</Label>
          <Textarea
            id="site-autoreply-body"
            rows={6}
            value={current.contactAutoReplyBody}
            placeholder={placeholderFor("contactAutoReplyBody")}
            onChange={(event) => setTranslated("contactAutoReplyBody", event.target.value)}
          />
          <p className={styles.hint}>
            Use <code>{"{{name}}"}</code> anywhere in the subject or body to insert the sender&rsquo;s name. The
            reply is sent in the language of the page the visitor wrote from.
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
