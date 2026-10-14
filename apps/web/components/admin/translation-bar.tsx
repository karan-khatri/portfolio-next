"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LuCheck, LuLanguages, LuLoaderCircle, LuPlus } from "react-icons/lu";
import type { EntityType } from "@portfolio/db/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTranslationAction } from "@/app/admin/(protected)/translation-actions";
import { LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import styles from "./translation-bar.module.scss";

export interface TranslationBarItem {
  locale: AppLocale;
  id: string | null;
  status: string | null;
}

const BASE_PATHS: Record<EntityType, string> = {
  Page: "/admin/pages",
  Project: "/admin/projects",
  Post: "/admin/posts",
};

export function TranslationBar({
  entityType,
  sourceId,
  sourceSlug,
  current,
  items,
}: {
  entityType: EntityType;
  sourceId: string;
  sourceSlug: string;
  current: AppLocale;
  items: TranslationBarItem[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState<AppLocale | null>(null);
  const [slug, setSlug] = useState(sourceSlug);
  const [pending, startTransition] = useTransition();

  function startCreate(locale: AppLocale) {
    setSlug(sourceSlug);
    setCreating(locale);
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!creating) return;
    const locale = creating;
    startTransition(async () => {
      const result = await createTranslationAction({ entityType, sourceId, locale, slug });
      if (result.error || !result.id) {
        toast.error(result.error ?? "Could not create the translation");
        return;
      }
      toast.success(`${LOCALE_META[locale].nativeName} translation created`);
      router.push(`${BASE_PATHS[entityType]}/${result.id}`);
    });
  }

  return (
    <div className={styles.bar}>
      <span className={styles.label}>
        <LuLanguages className={styles.labelIcon} aria-hidden="true" />
        Language
      </span>

      <ul className={styles.tabs}>
        {items.map((item) => {
          const meta = LOCALE_META[item.locale];
          if (item.locale === current) {
            return (
              <li key={item.locale}>
                <span className={styles.tabActive} aria-current="true">
                  {meta.nativeName}
                </span>
              </li>
            );
          }
          if (item.id) {
            return (
              <li key={item.locale}>
                <Link href={`${BASE_PATHS[entityType]}/${item.id}`} className={styles.tab}>
                  <LuCheck className={styles.tabIcon} aria-hidden="true" />
                  {meta.nativeName}
                  <span className={styles.tabStatus}>{item.status?.toLowerCase()}</span>
                </Link>
              </li>
            );
          }
          return (
            <li key={item.locale}>
              <button
                type="button"
                className={styles.tabAdd}
                onClick={() => startCreate(item.locale)}
                aria-expanded={creating === item.locale}
              >
                <LuPlus className={styles.tabIcon} aria-hidden="true" />
                Add {meta.nativeName}
              </button>
            </li>
          );
        })}
      </ul>

      {creating ? (
        <form onSubmit={handleCreate} className={styles.createForm}>
          <p className={styles.createHint}>
            Creates a {LOCALE_META[creating].nativeName} draft pre-filled with the current content, ready for you to
            translate.
          </p>
          <div className={styles.createRow}>
            <div className={styles.field}>
              <Label htmlFor="translation-slug">{LOCALE_META[creating].nativeName} slug</Label>
              <Input
                id="translation-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
              Create translation
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(null)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
