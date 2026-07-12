"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { sectionRegistry } from "@portfolio/sections";
import { SectionForm } from "./section-form";
import type { ComposerSection } from "./types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { sectionIcons } from "@/lib/admin/section-icons";
import styles from "./section-list.module.scss";

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
  const [isDragging, setIsDragging] = useState(false);
  const Icon = sectionIcons[section.type];

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={styles.itemWrapper}
    >
      <div
        className={styles.card}
        data-enabled={section.enabled ? undefined : "false"}
        data-dragging={isDragging || undefined}
      >
        <button
          type="button"
          onPointerDown={(event) => controls.start(event)}
          className={styles.dragHandle}
          aria-label="Drag to reorder"
        >
          <GripVerticalIcon className={styles.dragIcon} />
        </button>

        <div className={styles.body}>
          <div className={styles.cardHeader}>
            <span className={styles.typeLabel}>
              <Icon className={styles.typeIcon} />
              {sectionRegistry[section.type].label}
            </span>
            <div className={styles.headerControls}>
              <div className={styles.enabledToggle}>
                <Switch
                  id={`enabled-${section.clientId}`}
                  checked={section.enabled}
                  onCheckedChange={onToggle}
                />
                <Label htmlFor={`enabled-${section.clientId}`} className={styles.enabledLabel}>
                  Enabled
                </Label>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
                <Trash2Icon />
              </Button>
            </div>
          </div>
          <SectionForm type={section.type} content={section.content} onChange={onContentChange} />
        </div>
      </div>
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
    <Reorder.Group axis="y" values={sections} onReorder={onReorder} className={styles.list}>
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
