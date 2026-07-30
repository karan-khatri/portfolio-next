"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  saveDraftAction,
  publishAction,
  unpublishAction,
  createPreviewAction,
  toggleFeaturedAction,
  type ProjectFormInput,
} from "@/app/admin/(protected)/projects/[id]/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/admin/tag-input";
import { MediaPicker } from "@/components/admin/media-picker";
import { ProjectGalleryPicker, type GalleryImageEntry } from "@/components/admin/project-gallery-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor-dynamic";
import { SeoFieldsPanel } from "@/components/admin/seo-fields-panel";
import { ComposerActionBar } from "@/components/admin/composer-action-bar";
import { EditorShell, PreviewLinkBox } from "@/components/admin/editor-shell";
import { RevisionHistoryPanel, type RevisionHistoryItem } from "@/components/admin/revision-history-panel";
import { useEntityEditor } from "@/lib/admin/use-entity-editor";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./project-editor.module.scss";

interface SeoInitial {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: MediaPickerValue | null;
  structuredData: unknown;
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
  featured: boolean;
  galleryImages: GalleryImageEntry[];
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
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState(initial.tags);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [codeRepository, setCodeRepository] = useState(initial.codeRepository);
  const [liveUrl, setLiveUrl] = useState(initial.liveUrl);
  const [featured, setFeatured] = useState(initial.featured);
  const [galleryImages, setGalleryImages] = useState(initial.galleryImages);
  const [togglingFeatured, startTogglingFeatured] = useTransition();

  const loadedProjectId = useRef(projectId);
  useEffect(() => {
    if (loadedProjectId.current === projectId) return;
    loadedProjectId.current = projectId;
    setTitle(initial.title);
    setExcerpt(initial.excerpt);
    setBody(initial.body);
    setTags(initial.tags);
    setCoverImage(initial.coverImage);
    setCodeRepository(initial.codeRepository);
    setLiveUrl(initial.liveUrl);
    setFeatured(initial.featured);
    setGalleryImages(initial.galleryImages);
  }, [projectId, initial]);

  function toInput(): ProjectFormInput {
    return {
      title,
      excerpt,
      body,
      tags,
      coverImageId: coverImage?.id ?? null,
      codeRepository,
      liveUrl,
      galleryImageIds: galleryImages.map((entry) => entry.media.id),
    };
  }

  const { pending, previewUrl, handleSaveDraft, handlePublish, handleUnpublish, handlePreview, copyPreviewLink } =
    useEntityEditor({
      saveDraft: () => saveDraftAction(projectId, toInput()),
      publish: () => publishAction(projectId, toInput()),
      unpublish: () => unpublishAction(projectId),
      createPreview: () => createPreviewAction(projectId, toInput()),
    });

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
    <EditorShell
      backHref="/admin/projects"
      backLabel="Projects"
      heading="Edit project"
      status={projectStatus}
      hasDraft={hasDraft}
      sidebar={<RevisionHistoryPanel entityType="Project" entityId={projectId} revisions={revisions} />}
    >
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
          <ProjectGalleryPicker label="Gallery images" value={galleryImages} onChange={setGalleryImages} />
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
        </CardContent>
      </Card>

      <SeoFieldsPanel entityType="Project" entityId={projectId} initial={seo} />

      {previewUrl ? <PreviewLinkBox previewUrl={previewUrl} onCopy={copyPreviewLink} /> : null}

      <ComposerActionBar
        pending={pending}
        onSaveDraft={handleSaveDraft}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    </EditorShell>
  );
}
