"use client";

import { sectionFields, type SectionField } from "@/lib/admin/section-fields";
import type { SectionType } from "@portfolio/db";
import { LuArrowUp, LuArrowDown, LuPlus, LuTrash2 } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MediaPicker } from "@/components/admin/media-picker";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor-dynamic";
import type { MediaPickerValue } from "@/lib/admin/media";
import styles from "./section-form.module.scss";

function ListItemField({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  if (field.type === "select") {
    const options = field.options ?? [];
    const currentValue = typeof value === "string" ? value : (options[0]?.value ?? "");
    return (
      <div className={styles.listItemField}>
        <Label htmlFor={fieldId}>{field.label}</Label>
        <Select value={currentValue} onValueChange={(next) => onChange(next ?? "")}>
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
  return (
    <div className={styles.listItemField}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      <Input
        id={fieldId}
        value={typeof value === "string" ? value : ""}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextareaFieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  return (
    <div className={`${styles.field} ${styles.fieldWide}`}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      <Textarea
        id={fieldId}
        value={typeof value === "string" ? value : ""}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function RichTextFieldControl({
  field,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  return (
    <div className={`${styles.field} ${styles.fieldWide}`}>
      <Label>{field.label}</Label>
      <RichTextEditor value={typeof value === "string" ? value : ""} onChange={onChange} />
    </div>
  );
}

function ImageFieldControl({
  field,
  value,
  resolvedMedia,
  onResolveMedia,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  resolvedMedia: Record<string, MediaPickerValue>;
  onResolveMedia: (media: MediaPickerValue) => void;
  onChange: (value: string) => void;
}) {
  const imageId = typeof value === "string" ? value : null;
  return (
    <div className={`${styles.field} ${styles.fieldWide}`}>
      <MediaPicker
        label={field.label}
        value={imageId ? (resolvedMedia[imageId] ?? null) : null}
        onChange={(media) => {
          onChange(media?.id ?? "");
          if (media) onResolveMedia(media);
        }}
      />
    </div>
  );
}

function FileFieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  return (
    <div className={`${styles.field} ${styles.fieldWide}`}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      <MediaUrlField id={fieldId} value={typeof value === "string" ? value : ""} onChange={onChange} />
    </div>
  );
}

function SelectFieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  const options = field.options ?? [];
  const currentValue = typeof value === "string" ? value : (options[0]?.value ?? "");
  return (
    <div className={`${styles.field} ${styles.fieldWide}`}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      <Select value={currentValue} onValueChange={(next) => onChange(next ?? "")}>
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

function BooleanFieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: boolean) => void;
}) {
  const checked = typeof value === "boolean" ? value : true;
  return (
    <div className={`${styles.field} ${styles.switchField}`}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      <Switch id={fieldId} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function NumberFieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.field}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      <Input
        id={fieldId}
        type="number"
        value={typeof value === "number" ? value : ""}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextFieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.field}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      <Input
        id={fieldId}
        type={field.type === "email" ? "email" : "text"}
        value={typeof value === "string" ? value : ""}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ListFieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SectionField;
  fieldId: string;
  value: unknown;
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const itemFields = field.itemFields ?? [];

  function updateItem(index: number, key: string, itemValue: string) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: itemValue } : item)));
  }

  function addItem() {
    const blank: Record<string, unknown> = { id: crypto.randomUUID() };
    for (const itemField of itemFields) {
      if (itemField.type === "select" && itemField.options?.length) {
        blank[itemField.key] = itemField.options[0].value;
      }
    }
    onChange([...items, blank]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className={`${styles.field} ${styles.fieldWide}`}>
      <Label>{field.label}</Label>
      <div className={styles.listItems}>
        {items.map((item, index) => (
          <div key={(item.id as string) ?? index} className={styles.listItem}>
            <div className={styles.listItemFields}>
              {itemFields.map((itemField) => (
                <ListItemField
                  key={itemField.key}
                  field={itemField}
                  fieldId={`${fieldId}-${index}-${itemField.key}`}
                  value={item[itemField.key]}
                  onChange={(next) => updateItem(index, itemField.key, next)}
                />
              ))}
            </div>
            <div className={styles.listItemActions}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                <LuArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
              >
                <LuArrowDown />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(index)} aria-label="Remove item">
                <LuTrash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addItem} className={styles.addItemButton}>
        <LuPlus />
        Add item
      </Button>
    </div>
  );
}

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

        switch (field.type) {
          case "textarea":
            return (
              <TextareaFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => setField(field.key, next)}
              />
            );
          case "richtext":
            return (
              <RichTextFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => setField(field.key, next)}
              />
            );
          case "image":
            return (
              <ImageFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                resolvedMedia={resolvedMedia}
                onResolveMedia={onResolveMedia}
                onChange={(next) => setField(field.key, next)}
              />
            );
          case "file":
            return (
              <FileFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => setField(field.key, next)}
              />
            );
          case "select":
            return (
              <SelectFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => setField(field.key, next)}
              />
            );
          case "boolean":
            return (
              <BooleanFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => onChange({ ...content, [field.key]: next })}
              />
            );
          case "list":
            return (
              <ListFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => onChange({ ...content, [field.key]: next })}
              />
            );
          case "number":
            return (
              <NumberFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => setNumberField(field.key, next)}
              />
            );
          default:
            return (
              <TextFieldControl
                key={field.key}
                field={field}
                fieldId={fieldId}
                value={value}
                onChange={(next) => setField(field.key, next)}
              />
            );
        }
      })}
    </div>
  );
}
