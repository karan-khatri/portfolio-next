"use client";

import { sectionFields } from "@/lib/admin/section-fields";
import type { SectionType } from "@portfolio/db";
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
import { MediaPicker } from "@/components/admin/media-picker";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./section-form.module.scss";

export function SectionForm({
  type,
  content,
  onChange,
  resolvedMedia,
  onResolveMedia,
}: {
  type: SectionType;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  resolvedMedia: Record<string, MediaPickerValue>;
  onResolveMedia: (media: MediaPickerValue) => void;
}) {
  const fields = sectionFields[type];

  function setField(key: string, value: string) {
    if (value === "") {
      const rest = { ...content };
      delete rest[key];
      onChange(rest);
      return;
    }
    onChange({ ...content, [key]: value });
  }

  function setNumberField(key: string, value: string) {
    if (value === "") {
      const rest = { ...content };
      delete rest[key];
      onChange(rest);
      return;
    }
    onChange({ ...content, [key]: Number(value) });
  }

  return (
    <div className={styles.fieldGroup}>
      {fields.map((field) => {
        const value = content[field.key];
        const fieldId = `${type}-${field.key}`;
        if (field.type === "textarea") {
          return (
            <div key={field.key} className={`${styles.field} ${styles.fieldWide}`}>
              <Label htmlFor={fieldId}>{field.label}</Label>
              <Textarea
                id={fieldId}
                value={typeof value === "string" ? value : ""}
                required={field.required}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            </div>
          );
        }
        if (field.type === "richtext") {
          return (
            <div key={field.key} className={`${styles.field} ${styles.fieldWide}`}>
              <Label htmlFor={fieldId}>{field.label}</Label>
              <RichTextEditor
                value={typeof value === "string" ? value : ""}
                onChange={(html) => setField(field.key, html)}
              />
            </div>
          );
        }
        if (field.type === "image") {
          const imageId = typeof value === "string" ? value : null;
          return (
            <div key={field.key} className={`${styles.field} ${styles.fieldWide}`}>
              <MediaPicker
                label={field.label}
                value={imageId ? (resolvedMedia[imageId] ?? null) : null}
                onChange={(media) => {
                  setField(field.key, media?.id ?? "");
                  if (media) onResolveMedia(media);
                }}
              />
            </div>
          );
        }
        if (field.type === "file") {
          return (
            <div key={field.key} className={`${styles.field} ${styles.fieldWide}`}>
              <Label htmlFor={fieldId}>{field.label}</Label>
              <MediaUrlField
                id={fieldId}
                value={typeof value === "string" ? value : ""}
                onChange={(url) => setField(field.key, url)}
              />
            </div>
          );
        }
        if (field.type === "select") {
          const options = field.options ?? [];
          const currentValue = typeof value === "string" ? value : (options[0]?.value ?? "");
          return (
            <div key={field.key} className={`${styles.field} ${styles.fieldWide}`}>
              <Label htmlFor={fieldId}>{field.label}</Label>
              <Select value={currentValue} onValueChange={(next) => setField(field.key, next ?? "")}>
                <SelectTrigger id={fieldId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        if (field.type === "number") {
          return (
            <div key={field.key} className={styles.field}>
              <Label htmlFor={fieldId}>{field.label}</Label>
              <Input
                id={fieldId}
                type="number"
                value={typeof value === "number" ? value : ""}
                required={field.required}
                onChange={(event) => setNumberField(field.key, event.target.value)}
              />
            </div>
          );
        }
        return (
          <div key={field.key} className={styles.field}>
            <Label htmlFor={fieldId}>{field.label}</Label>
            <Input
              id={fieldId}
              type={field.type === "email" ? "email" : "text"}
              value={typeof value === "string" ? value : ""}
              required={field.required}
              onChange={(event) => setField(field.key, event.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
