"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import {
  saveDraftAction,
  publishAction,
  unpublishAction,
  createPreviewAction,
  type ProjectFormInput,
} from "@/app/admin/(protected)/projects/[id]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/status-badge";
import { TagInput } from "@/components/admin/tag-input";
import { MediaPicker } from "@/components/admin/media-picker";
import { SeoFieldsPanel } from "@/components/admin/seo-fields-panel";
import { ComposerActionBar } from "@/components/admin/composer-action-bar";
import { RevisionHistoryPanel, type RevisionHistoryItem } from "@/components/admin/revision-history-panel";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./project-editor.module.scss";

interface SeoInitial {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  nofollow: boolean;
}

interface ProjectEditorInitial {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImage: MediaPickerValue | null;
  codeRepository: string;
  liveUrl: string;
  programmingLanguages: string[];
}

export function ProjectEditor({
  projectId,
  projectStatus,
  hasDraft,
  revisions,
  initial,
  seo,
}: {
  projectId: string;
  projectStatus: string;
  hasDraft: boolean;
  revisions: RevisionHistoryItem[];
  initial: ProjectEditorInitial;
  seo: SeoInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState(initial.tags);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [codeRepository, setCodeRepository] = useState(initial.codeRepository);
  const [liveUrl, setLiveUrl] = useState(initial.liveUrl);
  const [programmingLanguages, setProgrammingLanguages] = useState(initial.programmingLanguages);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Re-sync when the server re-fetches (e.g. after restoring an older
  // revision via <RevisionHistoryPanel>, which calls router.refresh() from
  // a sibling component) — useState's initial value only applies on mount,
  // so without this the form would keep showing stale content.
  useEffect(() => {
    setTitle(initial.title);
    setExcerpt(initial.excerpt);
    setBody(initial.body);
    setTags(initial.tags);
    setCoverImage(initial.coverImage);
    setCodeRepository(initial.codeRepository);
    setLiveUrl(initial.liveUrl);
    setProgrammingLanguages(initial.programmingLanguages);
  }, [initial]);

  function toInput(): ProjectFormInput {
    return {
      title,
      excerpt,
      body,
      tags,
      coverImageId: coverImage?.id ?? null,
      codeRepository,
      liveUrl,
      programmingLanguages,
    };
  }

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveDraftAction(projectId, toInput());
      if (result.error) toast.error(result.error);
      else toast.success("Draft saved");
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishAction(projectId, toInput());
      if (result.error) toast.error(result.error);
      else {
        toast.success("Published");
        router.refresh();
      }
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const result = await unpublishAction(projectId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Unpublished");
        router.refresh();
      }
    });
  }

  function handlePreview() {
    setPreviewUrl(null);
    startTransition(async () => {
      const result = await createPreviewAction(projectId, toInput());
      if (result.error) toast.error(result.error);
      else if (result.previewToken) setPreviewUrl(`/preview/${result.previewToken}`);
    });
  }

  function copyPreviewLink() {
    if (!previewUrl) return;
    navigator.clipboard.writeText(`${window.location.origin}${previewUrl}`);
    toast.success("Copied preview link");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/admin/projects" className={styles.backLink}>
          <ArrowLeftIcon className={styles.backIcon} />
          Projects
        </Link>
        <div className={styles.titleRow}>
          <h1 className={styles.heading}>Edit project</h1>
          <StatusBadge status={projectStatus} />
          {hasDraft ? <StatusBadge status="UNPUBLISHED DRAFT LOADED" /> : null}
        </div>
      </div>

      <Card>
        <CardContent className={styles.fieldGroup}>
          <div className={styles.field}>
            <Label htmlFor="project-title">Title</Label>
            <Input id="project-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className={styles.field}>
            <Label htmlFor="project-excerpt">Excerpt</Label>
            <Textarea
              id="project-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <Label htmlFor="project-body">Body</Label>
            <Textarea
              id="project-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className={styles.bodyTextarea}
            />
          </div>
          <TagInput label="Tags" value={tags} onChange={setTags} placeholder="Type a tag, press Enter" />
          <MediaPicker label="Cover image" value={coverImage} onChange={setCoverImage} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <Label htmlFor="project-repo">Code repository</Label>
              <Input
                id="project-repo"
                type="url"
                value={codeRepository}
                onChange={(event) => setCodeRepository(event.target.value)}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="project-live">Live URL</Label>
              <Input
                id="project-live"
                type="url"
                value={liveUrl}
                onChange={(event) => setLiveUrl(event.target.value)}
              />
            </div>
          </div>
          <TagInput
            label="Programming languages"
            value={programmingLanguages}
            onChange={setProgrammingLanguages}
            placeholder="Type a language, press Enter"
          />
        </CardContent>
      </Card>

      <SeoFieldsPanel entityType="Project" entityId={projectId} initial={seo} />

      {previewUrl ? (
        <div className={styles.previewBox}>
          <a href={previewUrl} target="_blank" rel="noreferrer" className={styles.previewLink}>
            {previewUrl}
            <ExternalLinkIcon className={styles.previewIcon} />
          </a>
          <Button type="button" variant="ghost" size="icon-sm" onClick={copyPreviewLink}>
            <CopyIcon />
          </Button>
        </div>
      ) : null}

      <RevisionHistoryPanel entityType="Project" entityId={projectId} revisions={revisions} />

      <ComposerActionBar
        pending={pending}
        onSaveDraft={handleSaveDraft}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    </div>
  );
}
