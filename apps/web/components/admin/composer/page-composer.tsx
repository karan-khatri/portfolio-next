"use client";

import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import type { SectionType } from "@portfolio/db";
import { sectionRegistry } from "@portfolio/sections";
import { SectionListEditor } from "./section-list";
import type { ComposerSection } from "./types";
import type { MediaPickerValue } from "@/lib/admin/media";
import {
  saveDraftAction,
  publishAction,
  unpublishAction,
  createPreviewAction,
} from "@/app/admin/(protected)/pages/[id]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComposerActionBar } from "@/components/admin/composer-action-bar";
import { EditorShell, PreviewLinkBox } from "@/components/admin/editor-shell";
import { RevisionHistoryPanel, type RevisionHistoryItem } from "@/components/admin/revision-history-panel";
import { useEntityEditor } from "@/lib/admin/use-entity-editor";
import styles from "./page-composer.module.scss";

export type { ComposerSection };

const ALL_SECTION_TYPES = Object.keys(sectionRegistry) as SectionType[];

export function PageComposer({
  pageId,
  pageStatus,
  initialTitle,
  initialSections,
  initialResolvedMedia,
  hasDraft,
  revisions,
}: {
  pageId: string;
  pageStatus: string;
  initialTitle: string;
  initialSections: ComposerSection[];
  initialResolvedMedia: Record<string, MediaPickerValue>;
  hasDraft: boolean;
  revisions: RevisionHistoryItem[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [sections, setSections] = useState(initialSections);
  const [resolvedMedia, setResolvedMedia] = useState(initialResolvedMedia);
  const [newSectionType, setNewSectionType] = useState<SectionType>(ALL_SECTION_TYPES[0]);

  useEffect(() => {
    setTitle(initialTitle);
    setSections(initialSections);
    setResolvedMedia(initialResolvedMedia);
  }, [initialTitle, initialSections, initialResolvedMedia]);

  function toInput() {
    return sections.map((section, index) => ({
      type: section.type,
      order: index,
      enabled: section.enabled,
      content: section.content,
    }));
  }

  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        clientId: crypto.randomUUID(),
        type: newSectionType,
        order: prev.length,
        enabled: true,
        content: sectionRegistry[newSectionType].defaultContent() as Record<string, unknown>,
      },
    ]);
  }

  function removeSection(clientId: string) {
    setSections((prev) => prev.filter((section) => section.clientId !== clientId));
  }

  function toggleSection(clientId: string) {
    setSections((prev) =>
      prev.map((section) =>
        section.clientId === clientId ? { ...section, enabled: !section.enabled } : section,
      ),
    );
  }

  function updateContent(clientId: string, content: Record<string, unknown>) {
    setSections((prev) =>
      prev.map((section) => (section.clientId === clientId ? { ...section, content } : section)),
    );
  }

  function resolveMedia(media: MediaPickerValue) {
    setResolvedMedia((prev) => ({ ...prev, [media.id]: media }));
  }

  const { pending, previewUrl, handleSaveDraft, handlePublish, handleUnpublish, handlePreview, copyPreviewLink } =
    useEntityEditor({
      saveDraft: () => saveDraftAction(pageId, title, toInput()),
      publish: () => publishAction(pageId, title, toInput()),
      unpublish: () => unpublishAction(pageId),
      createPreview: () => createPreviewAction(pageId, title, toInput()),
    });

  return (
    <EditorShell
      backHref="/admin/pages"
      backLabel="Pages"
      heading="Edit page"
      status={pageStatus}
      hasDraft={hasDraft}
      sidebar={<RevisionHistoryPanel entityType="Page" entityId={pageId} revisions={revisions} />}
    >
      <Card>
        <CardContent>
          <div className={styles.field}>
            <Label htmlFor="page-title">Title</Label>
            <Input
              id="page-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <SectionListEditor
        sections={sections}
        onReorder={setSections}
        onToggle={toggleSection}
        onRemove={removeSection}
        onContentChange={updateContent}
        resolvedMedia={resolvedMedia}
        onResolveMedia={resolveMedia}
      />

      <div className={styles.addSectionRow}>
        <Select value={newSectionType} onValueChange={(value) => setNewSectionType(value as SectionType)}>
          <SelectTrigger className={styles.addSectionSelect}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_SECTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {sectionRegistry[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={addSection}>
          <LuPlus />
          Add section
        </Button>
      </div>

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
