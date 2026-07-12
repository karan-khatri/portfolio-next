"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { sectionRegistry } from "@portfolio/sections";
import { SectionForm } from "./section-form";
import type { ComposerSection } from "./types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function SortableSectionItem({
  section,
  onToggle,
  onRemove,
  onContentChange,
}: {
  section: ComposerSection;
  onToggle: () => void;
  onRemove: () => void;
  onContentChange: (content: Record<string, unknown>) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      className="list-none"
    >
      <Card className={cn(!section.enabled && "opacity-60")}>
        <div className="flex items-start gap-2 px-4">
          <button
            type="button"
            onPointerDown={(event) => controls.start(event)}
            className="mt-1 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVerticalIcon className="size-4" />
          </button>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{sectionRegistry[section.type].label}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Switch
                    id={`enabled-${section.clientId}`}
                    checked={section.enabled}
                    onCheckedChange={onToggle}
                  />
                  <Label
                    htmlFor={`enabled-${section.clientId}`}
                    className="text-xs text-muted-foreground"
                  >
                    Enabled
                  </Label>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
                  <Trash2Icon />
                </Button>
              </div>
            </div>
            <SectionForm
              type={section.type}
              content={section.content}
              onChange={onContentChange}
            />
          </div>
        </div>
      </Card>
    </Reorder.Item>
  );
}

export function SectionListEditor({
  sections,
  onReorder,
  onToggle,
  onRemove,
  onContentChange,
}: {
  sections: ComposerSection[];
  onReorder: (sections: ComposerSection[]) => void;
  onToggle: (clientId: string) => void;
  onRemove: (clientId: string) => void;
  onContentChange: (clientId: string, content: Record<string, unknown>) => void;
}) {
  return (
    <Reorder.Group axis="y" values={sections} onReorder={onReorder} className="space-y-3">
      {sections.map((section) => (
        <SortableSectionItem
          key={section.clientId}
          section={section}
          onToggle={() => onToggle(section.clientId)}
          onRemove={() => onRemove(section.clientId)}
          onContentChange={(content) => onContentChange(section.clientId, content)}
        />
      ))}
    </Reorder.Group>
  );
}
