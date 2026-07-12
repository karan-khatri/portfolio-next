"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, CopyIcon, ExternalLinkIcon, Loader2Icon, PlusIcon } from "lucide-react";
import type { SectionType } from "@portfolio/db";
import { sectionRegistry } from "@portfolio/sections";
import { SectionListEditor } from "./section-list";
import type { ComposerSection } from "./types";
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
import { StatusBadge } from "@/components/admin/status-badge";

export type { ComposerSection };

const ALL_SECTION_TYPES = Object.keys(sectionRegistry) as SectionType[];

export function PageComposer({
  pageId,
  pageStatus,
  initialTitle,
  initialSections,
  hasDraft,
}: {
  pageId: string;
  pageStatus: string;
  initialTitle: string;
  initialSections: ComposerSection[];
  hasDraft: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [sections, setSections] = useState(initialSections);
  const [newSectionType, setNewSectionType] = useState<SectionType>(ALL_SECTION_TYPES[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveDraftAction(pageId, title, toInput());
      if (result.error) toast.error(result.error);
      else toast.success("Draft saved");
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishAction(pageId, title, toInput());
      if (result.error) toast.error(result.error);
      else {
        toast.success("Published");
        router.refresh();
      }
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const result = await unpublishAction(pageId);
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
      const result = await createPreviewAction(pageId, title, toInput());
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
    <div className="space-y-6 pb-24">
      <div className="space-y-3">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Pages
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Edit page</h1>
          <StatusBadge status={pageStatus} />
          {hasDraft ? <StatusBadge status="UNPUBLISHED DRAFT LOADED" /> : null}
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-1.5">
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
      />

      <div className="flex items-center gap-2">
        <Select value={newSectionType} onValueChange={(value) => setNewSectionType(value as SectionType)}>
          <SelectTrigger className="w-48">
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
          <PlusIcon />
          Add section
        </Button>
      </div>

      {previewUrl ? (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2 text-sm">
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center gap-1.5 truncate hover:underline"
          >
            {previewUrl}
            <ExternalLinkIcon className="size-3.5 shrink-0" />
          </a>
          <Button type="button" variant="ghost" size="icon-sm" onClick={copyPreviewLink}>
            <CopyIcon />
          </Button>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-3">
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            Save draft
          </Button>
          <Button type="button" variant="outline" onClick={handlePreview} disabled={pending}>
            Preview
          </Button>
          <Button type="button" onClick={handlePublish} disabled={pending}>
            Publish
          </Button>
          <Button type="button" variant="destructive" onClick={handleUnpublish} disabled={pending}>
            Unpublish
          </Button>
        </div>
      </div>
    </div>
  );
}
