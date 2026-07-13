"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";
import { GripVerticalIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SimpleContentType, SimpleField } from "@/lib/admin/simple-content-fields";
import { simpleContentSummaries } from "@/lib/admin/simple-content-fields";
import styles from "./simple-content-list.module.scss";

export interface SimpleContentItem {
  id: string;
  order: number;
  [key: string]: unknown;
}

interface ActionResult {
  error?: string;
}

function toInputValue(field: SimpleField, raw: unknown): string {
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
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.key, toInputValue(field, initialValues[field.key])]),
    ),
  );

  function setField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.key];
      if (field.type === "number") {
        payload[field.key] = raw === "" ? null : Number(raw);
      } else if (field.type === "date") {
        payload[field.key] = raw === "" ? null : new Date(raw);
      } else {
        payload[field.key] = raw === "" ? null : raw;
      }
    }
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGrid}>
        {fields.map((field) => {
          const fieldId = `${idPrefix}-${field.key}`;
          return (
            <div key={field.key} className={styles.field}>
              <Label htmlFor={fieldId}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={fieldId}
                  value={values[field.key]}
                  required={field.required}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
              ) : (
                <Input
                  id={fieldId}
                  type={toInputType(field)}
                  value={values[field.key]}
                  required={field.required}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2Icon className={styles.spinner} /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}

function SortableRow({
  item,
  fields,
  contentType,
  onUpdate,
  onDelete,
}: {
  item: SimpleContentItem;
  fields: SimpleField[];
  contentType: SimpleContentType;
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

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={styles.itemWrapper}
    >
      <details className={styles.itemCard}>
        <summary className={styles.itemSummary}>
          <button
            type="button"
            onPointerDown={(event) => controls.start(event)}
            className={styles.dragHandle}
            aria-label="Drag to reorder"
          >
            <GripVerticalIcon className={styles.dragIcon} />
          </button>
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
            <Trash2Icon />
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
    </Reorder.Item>
  );
}

export function SimpleContentList({
  items,
  fields,
  contentType,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  emptyLabel,
}: {
  items: SimpleContentItem[];
  fields: SimpleField[];
  contentType: SimpleContentType;
  onCreate: (values: Record<string, unknown>) => Promise<ActionResult>;
  onUpdate: (id: string, values: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  onReorder: (orderedIds: string[]) => Promise<ActionResult>;
  emptyLabel: string;
}) {
  const router = useRouter();
  const [orderedItems, setOrderedItems] = useState(items);
  const [creating, startCreating] = useTransition();

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  function handleReorder(next: SimpleContentItem[]) {
    setOrderedItems(next);
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
        router.refresh();
      }
    });
  }

  return (
    <div className={styles.list}>
      <Reorder.Group axis="y" values={orderedItems} onReorder={handleReorder} className={styles.group}>
        {orderedItems.map((item) => (
          <SortableRow
            key={item.id}
            item={item}
            fields={fields}
            contentType={contentType}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </Reorder.Group>
      {orderedItems.length === 0 ? <p className={styles.empty}>{emptyLabel}</p> : null}

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <PlusIcon className={styles.createIcon} />
          Add new
        </summary>
        <div className={styles.createBody}>
          <SimpleContentForm
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
