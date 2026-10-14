"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";
import { LuGripVertical, LuLoaderCircle, LuPlus, LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/admin/tag-input";
import { RichTextEditor } from "@/components/admin/rich-text-editor-dynamic";
import type { SimpleContentType, SimpleField } from "@/lib/admin/simple-content-fields";
import { simpleContentSummaries } from "@/lib/admin/simple-content-fields";
import type { ActionResult } from "@/lib/admin/action-result";
import styles from "./simple-content-list.module.scss";

export interface SimpleContentItem {
  id: string;
  order?: number;
  [key: string]: unknown;
}

export type FieldValue = string | string[] | boolean;

export function toInputValue(field: SimpleField, raw: unknown): FieldValue {
  if (field.type === "tags") return Array.isArray(raw) ? raw : [];
  if (field.type === "boolean") return Boolean(raw);
  if (raw == null) return "";
  if (field.type === "date" && raw instanceof Date) {
    return raw.toISOString().slice(0, 10);
  }
  return String(raw);
}

function toInputType(field: SimpleField): string {
  if (field.type === "number") return "number";
  if (field.type === "date") return "date";
  if (field.type === "url") return "url";
  return "text";
}

export function FieldControl({
  field,
  fieldId,
  value,
  onChange,
}: {
  field: SimpleField;
  fieldId: string;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
}) {
  if (field.type === "tags") {
    return (
      <div className={styles.field}>
        <TagInput label={field.label} value={value as string[]} onChange={onChange} />
      </div>
    );
  }
  if (field.type === "boolean") {
    return (
      <div className={styles.booleanField}>
        <Switch id={fieldId} checked={value as boolean} onCheckedChange={onChange} />
        <Label htmlFor={fieldId}>{field.booleanLabel ?? field.label}</Label>
      </div>
    );
  }
  if (field.type === "richtext") {
    return (
      <div className={styles.field}>
        <Label htmlFor={fieldId}>{field.label}</Label>
        <RichTextEditor value={value as string} onChange={(html) => onChange(html)} />
      </div>
    );
  }
  return (
    <div className={styles.field}>
      <Label htmlFor={fieldId}>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea
          id={fieldId}
          value={value as string}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={fieldId}
          type={toInputType(field)}
          value={value as string}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

export function serializeFieldValue(field: SimpleField, raw: FieldValue): unknown {
  if (field.type === "tags" || field.type === "boolean") return raw;
  if (field.type === "number") return raw === "" ? null : Number(raw);
  if (field.type === "date") return raw === "" ? null : new Date(raw as string);
  return raw === "" ? null : raw;
}

function SimpleContentForm({
  idPrefix,
  fields,
  initialValues,
  onSubmit,
  submitLabel,
  pending,
}: {
  idPrefix: string;
  fields: SimpleField[];
  initialValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  submitLabel: string;
  pending: boolean;
}) {
  const [values, setValues] = useState<Record<string, FieldValue>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.key, toInputValue(field, initialValues[field.key])]),
    ),
  );

  function setField(key: string, value: FieldValue) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      payload[field.key] = serializeFieldValue(field, values[field.key]);
    }
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGrid}>
        {fields.map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            fieldId={`${idPrefix}-${field.key}`}
            value={values[field.key]}
            onChange={(next) => setField(field.key, next)}
          />
        ))}
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}

function SortableRow({
  item,
  fields,
  contentType,
  reorderable,
  onUpdate,
  onDelete,
}: {
  item: SimpleContentItem;
  fields: SimpleField[];
  contentType: SimpleContentType;
  reorderable: boolean;
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const controls = useDragControls();
  const [pending, startTransition] = useTransition();
  const { primary, secondary } = simpleContentSummaries[contentType](item);

  function handleUpdate(values: Record<string, unknown>) {
    startTransition(async () => {
      const result = await onUpdate(item.id, values);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Saved");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await onDelete(item.id);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  const body = (
    <details className={styles.itemCard}>
      <summary className={styles.itemSummary}>
        {reorderable ? (
          <button
            type="button"
            onPointerDown={(event) => controls.start(event)}
            className={styles.dragHandle}
            aria-label="Drag to reorder"
          >
            <LuGripVertical className={styles.dragIcon} />
          </button>
        ) : null}
        <span className={styles.summaryText}>
          <span className={styles.primary}>{primary}</span>
          {secondary ? <span className={styles.secondary}>{secondary}</span> : null}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={(event) => {
            event.preventDefault();
            handleDelete();
          }}
          disabled={pending}
          aria-label="Delete"
        >
          <LuTrash2 />
        </Button>
      </summary>
      <div className={styles.itemBody}>
        <SimpleContentForm
          idPrefix={item.id}
          fields={fields}
          initialValues={item}
          onSubmit={handleUpdate}
          submitLabel="Save"
          pending={pending}
        />
      </div>
    </details>
  );

  if (!reorderable) {
    return <div className={styles.itemWrapper}>{body}</div>;
  }

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={styles.itemWrapper}
    >
      {body}
    </Reorder.Item>
  );
}

export function SimpleContentList({
  items,
  fields,
  contentType,
  reorderable = true,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  emptyLabel,
}: {
  items: SimpleContentItem[];
  fields: SimpleField[];
  contentType: SimpleContentType;
  reorderable?: boolean;
  onCreate: (values: Record<string, unknown>) => Promise<ActionResult>;
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  onReorder?: (orderedIds: string[]) => Promise<ActionResult>;
  emptyLabel: string;
}) {
  const router = useRouter();
  const [orderedItems, setOrderedItems] = useState(items);
  const [creating, startCreating] = useTransition();
  const [createKey, setCreateKey] = useState(0);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  function handleReorder(next: SimpleContentItem[]) {
    setOrderedItems(next);
    if (!onReorder) return;
    void onReorder(next.map((item) => item.id)).then((result) => {
      if (result?.error) toast.error(result.error);
    });
  }

  function handleCreate(values: Record<string, unknown>) {
    startCreating(async () => {
      const result = await onCreate(values);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Added");
        setCreateKey((key) => key + 1);
        router.refresh();
      }
    });
  }

  const rows = orderedItems.map((item) => (
    <SortableRow
      key={item.id}
      item={item}
      fields={fields}
      contentType={contentType}
      reorderable={reorderable}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  ));

  return (
    <div className={styles.list}>
      {reorderable ? (
        <Reorder.Group axis="y" values={orderedItems} onReorder={handleReorder} className={styles.group}>
          {rows}
        </Reorder.Group>
      ) : (
        <div className={styles.group}>{rows}</div>
      )}
      {orderedItems.length === 0 ? <p className={styles.empty}>{emptyLabel}</p> : null}

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <LuPlus className={styles.createIcon} />
          Add new
        </summary>
        <div className={styles.createBody}>
          <SimpleContentForm
            key={createKey}
            idPrefix="new"
            fields={fields}
            initialValues={{}}
            onSubmit={handleCreate}
            submitLabel="Add"
            pending={creating}
          />
        </div>
      </details>
    </div>
  );
}
