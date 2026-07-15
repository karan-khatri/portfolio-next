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
  type PostFormInput,
} from "@/app/admin/(protected)/posts/[id]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/status-badge";
import { TagInput } from "@/components/admin/tag-input";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SeoFieldsPanel } from "@/components/admin/seo-fields-panel";
import { ComposerActionBar } from "@/components/admin/composer-action-bar";
import { RevisionHistoryPanel, type RevisionHistoryItem } from "@/components/admin/revision-history-panel";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./post-editor.module.scss";

const NO_AUTHOR = "__none__";

interface SeoInitial {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  nofollow: boolean;
}

interface PostEditorInitial {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImage: MediaPickerValue | null;
  authorId: string | null;
}

export function PostEditor({
  postId,
  postStatus,
  hasDraft,
  revisions,
  authors,
  initial,
  seo,
}: {
  postId: string;
  postStatus: string;
  hasDraft: boolean;
  revisions: RevisionHistoryItem[];
  authors: { id: string; name: string }[];
  initial: PostEditorInitial;
  seo: SeoInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState(initial.tags);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [authorId, setAuthorId] = useState(initial.authorId ?? NO_AUTHOR);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setTitle(initial.title);
    setExcerpt(initial.excerpt);
    setBody(initial.body);
    setTags(initial.tags);
    setCoverImage(initial.coverImage);
    setAuthorId(initial.authorId ?? NO_AUTHOR);
  }, [initial]);

  function toInput(): PostFormInput {
    return {
      title,
      excerpt,
      body,
      tags,
      coverImageId: coverImage?.id ?? null,
      authorId: authorId === NO_AUTHOR ? null : authorId,
    };
  }

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveDraftAction(postId, toInput());
      if (result.error) toast.error(result.error);
      else toast.success("Draft saved");
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishAction(postId, toInput());
      if (result.error) toast.error(result.error);
      else {
        toast.success("Published");
        router.refresh();
      }
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const result = await unpublishAction(postId);
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
      const result = await createPreviewAction(postId, toInput());
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
        <Link href="/admin/posts" className={styles.backLink}>
          <ArrowLeftIcon className={styles.backIcon} />
          Posts
        </Link>
        <div className={styles.titleRow}>
          <h1 className={styles.heading}>Edit post</h1>
          <StatusBadge status={postStatus} />
          {hasDraft ? <StatusBadge status="UNPUBLISHED DRAFT LOADED" /> : null}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <Card>
            <CardContent className={styles.fieldGroup}>
              <div className={styles.field}>
                <Label htmlFor="post-title">Title</Label>
                <Input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className={styles.field}>
                <Label htmlFor="post-excerpt">Excerpt</Label>
                <Textarea id="post-excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
              </div>
              <div className={styles.field}>
                <Label htmlFor="post-body">Body</Label>
                <RichTextEditor value={body} onChange={setBody} placeholder="Write the post…" />
              </div>
              <TagInput label="Tags" value={tags} onChange={setTags} placeholder="Type a tag, press Enter" />
              <MediaPicker label="Cover image" value={coverImage} onChange={setCoverImage} />
              <div className={styles.field}>
                <Label htmlFor="post-author">Author</Label>
                <Select value={authorId} onValueChange={(value) => setAuthorId(value ?? NO_AUTHOR)}>
                  <SelectTrigger id="post-author" className={styles.authorSelect}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_AUTHOR}>No author</SelectItem>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <SeoFieldsPanel entityType="Post" entityId={postId} initial={seo} />

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
          <RevisionHistoryPanel entityType="Post" entityId={postId} revisions={revisions} />
        </div>
      </div>
    </div>
  );
}
