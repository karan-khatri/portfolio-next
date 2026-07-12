"use client";

import { sectionFields } from "@/lib/admin/section-fields";
import type { SectionType } from "@portfolio/db";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import styles from "./section-form.module.scss";

export function SectionForm({
  type,
  content,
  onChange,
}: {
  type: SectionType;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
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
