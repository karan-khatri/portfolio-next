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
  toggleFeaturedAction,
  type ProjectFormInput,
} from "@/app/admin/(protected)/projects/[id]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/admin/status-badge";
import { TagInput } from "@/components/admin/tag-input";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
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
  featured: boolean;
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
  const [featured, setFeatured] = useState(initial.featured);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [togglingFeatured, startTogglingFeatured] = useTransition();

  useEffect(() => {
    setTitle(initial.title);
    setExcerpt(initial.excerpt);
    setBody(initial.body);
    setTags(initial.tags);
    setCoverImage(initial.coverImage);
    setCodeRepository(initial.codeRepository);
    setLiveUrl(initial.liveUrl);
    setProgrammingLanguages(initial.programmingLanguages);
    setFeatured(initial.featured);
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

  function handleToggleFeatured(next: boolean) {
    setFeatured(next);
    startTogglingFeatured(async () => {
      const result = await toggleFeaturedAction(projectId, next);
      if (result.error) {
        toast.error(result.error);
        setFeatured(!next);
      } else {
        toast.success(next ? "Marked as featured" : "Removed from featured");
      }
    });
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

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
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
                <RichTextEditor value={body} onChange={setBody} placeholder="Write the project write-up…" />
              </div>
              <TagInput label="Tags" value={tags} onChange={setTags} placeholder="Type a tag, press Enter" />
              <MediaPicker label="Cover image" value={coverImage} onChange={setCoverImage} />
              <div className={styles.featuredField}>
                <Switch
                  id="project-featured"
                  checked={featured}
                  disabled={togglingFeatured}
                  onCheckedChange={handleToggleFeatured}
                />
                <Label htmlFor="project-featured">
                  Featured — include in the Home page&rsquo;s Featured/Slider set
                </Label>
              </div>
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

          <ComposerActionBar
            pending={pending}
            onSaveDraft={handleSaveDraft}
            onPreview={handlePreview}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
          />
        </div>

        <div className={styles.sidebarColumn}>
          <RevisionHistoryPanel entityType="Project" entityId={projectId} revisions={revisions} />
        </div>
      </div>
    </div>
  );
}
