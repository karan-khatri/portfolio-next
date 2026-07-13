"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { saveSeoAction } from "@/app/admin/(protected)/seo-actions";
import styles from "./seo-fields-panel.module.scss";

export function SeoFieldsPanel({
  entityType,
  entityId,
  initial,
}: {
  entityType: "Page" | "Project" | "Post";
  entityId: string;
  initial: {
    metaTitle: string | null;
    metaDescription: string | null;
    canonicalUrl: string | null;
    noindex: boolean;
    nofollow: boolean;
  };
}) {
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(initial.noindex);
  const [nofollow, setNofollow] = useState(initial.nofollow);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await saveSeoAction(entityType, entityId, {
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        noindex,
        nofollow,
      });
      if (result.error) toast.error(result.error);
      else toast.success("SEO saved");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.title}>SEO</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        <div className={styles.field}>
          <Label htmlFor="seo-title">Meta title</Label>
          <Input id="seo-title" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
        </div>
        <div className={styles.field}>
          <Label htmlFor="seo-description">Meta description</Label>
          <Textarea
            id="seo-description"
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="seo-canonical">Canonical URL</Label>
          <Input
            id="seo-canonical"
            value={canonicalUrl}
            onChange={(event) => setCanonicalUrl(event.target.value)}
          />
        </div>
        <div className={styles.switchRow}>
          <div className={styles.switchField}>
            <Switch id="seo-noindex" checked={noindex} onCheckedChange={setNoindex} />
            <Label htmlFor="seo-noindex">Noindex</Label>
          </div>
          <div className={styles.switchField}>
            <Switch id="seo-nofollow" checked={nofollow} onCheckedChange={setNofollow} />
            <Label htmlFor="seo-nofollow">Nofollow</Label>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSave}
          disabled={pending}
          className={styles.saveButton}
        >
          {pending ? <Loader2Icon className={styles.spinner} /> : null}
          Save SEO
        </Button>
      </CardContent>
    </Card>
  );
}
