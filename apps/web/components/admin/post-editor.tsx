"use client";

import { useEffect, useRef, useState } from "react";
import {
  saveDraftAction,
  publishAction,
  unpublishAction,
  createPreviewAction,
  type PostFormInput,
} from "@/app/admin/(protected)/posts/[id]/actions";
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
import { TagInput } from "@/components/admin/tag-input";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor-dynamic";
import { SeoFieldsPanel } from "@/components/admin/seo-fields-panel";
import { ComposerActionBar } from "@/components/admin/composer-action-bar";
import { EditorShell, PreviewLinkBox } from "@/components/admin/editor-shell";
import { RevisionHistoryPanel, type RevisionHistoryItem } from "@/components/admin/revision-history-panel";
import { useEntityEditor } from "@/lib/admin/use-entity-editor";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./post-editor.module.scss";

const NO_AUTHOR = "__none__";

interface SeoInitial {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: MediaPickerValue | null;
  structuredData: unknown;
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
  translationBar,
}: {
  postId: string;
  postStatus: string;
  hasDraft: boolean;
  revisions: RevisionHistoryItem[];
  authors: { id: string; name: string }[];
  initial: PostEditorInitial;
  seo: SeoInitial;
  translationBar?: React.ReactNode;
}) {
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState(initial.tags);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [authorId, setAuthorId] = useState(initial.authorId ?? NO_AUTHOR);

  const loadedPostId = useRef(postId);
  useEffect(() => {
    if (loadedPostId.current === postId) return;
    loadedPostId.current = postId;
    setTitle(initial.title);
    setExcerpt(initial.excerpt);
    setBody(initial.body);
    setTags(initial.tags);
    setCoverImage(initial.coverImage);
    setAuthorId(initial.authorId ?? NO_AUTHOR);
  }, [postId, initial]);

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

  const { pending, previewUrl, handleSaveDraft, handlePublish, handleUnpublish, handlePreview, copyPreviewLink } =
    useEntityEditor({
      saveDraft: () => saveDraftAction(postId, toInput()),
      publish: () => publishAction(postId, toInput()),
      unpublish: () => unpublishAction(postId),
      createPreview: () => createPreviewAction(postId, toInput()),
    });

  return (
    <EditorShell
      backHref="/admin/posts"
      backLabel="Posts"
      heading="Edit post"
      status={postStatus}
      hasDraft={hasDraft}
      translationBar={translationBar}
      sidebar={<RevisionHistoryPanel entityType="Post" entityId={postId} revisions={revisions} />}
    >
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
