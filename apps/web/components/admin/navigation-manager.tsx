"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";
import { LuCopy, LuGripVertical, LuLoaderCircle, LuPlus, LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createNavigationItemAction,
  updateNavigationItemAction,
  deleteNavigationItemAction,
  reorderNavigationItemAction,
  copyNavigationFromDefaultAction,
} from "@/app/admin/(protected)/navigation/actions";
import { DEFAULT_LOCALE, LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import styles from "./navigation-manager.module.scss";

export interface NavigationItemRow {
  id: string;
  label: string;
  href: string;
}

export interface NavigationItemWithChildren extends NavigationItemRow {
  children: NavigationItemRow[];
}

function useNavigationRowActions(itemId: string, onChanged: () => void) {
  const [pending, startTransition] = useTransition();

  function handleUpdate(values: { label: string; href: string }) {
    startTransition(async () => {
      const result = await updateNavigationItemAction(itemId, values);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Saved");
        onChanged();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteNavigationItemAction(itemId);
      if (result.error) toast.error(result.error);
      else onChanged();
    });
  }

  return { pending, handleUpdate, handleDelete };
}

function LinkForm({
  idPrefix,
  initial,
  submitLabel,
  pending,
  onSubmit,
}: {
  idPrefix: string;
  initial: { label: string; href: string };
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: { label: string; href: string }) => void;
}) {
  const [label, setLabel] = useState(initial.label);
  const [href, setHref] = useState(initial.href);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ label, href });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor={`${idPrefix}-label`}>Label</Label>
        <Input id={`${idPrefix}-label`} value={label} onChange={(e) => setLabel(e.target.value)} required />
      </div>
      <div className={styles.field}>
        <Label htmlFor={`${idPrefix}-href`}>Link</Label>
        <Input id={`${idPrefix}-href`} value={href} onChange={(e) => setHref(e.target.value)} required />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <LuLoaderCircle className={styles.spinner} /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}

function ChildRow({ item, onChanged }: { item: NavigationItemRow; onChanged: () => void }) {
  const controls = useDragControls();
  const { pending, handleUpdate, handleDelete } = useNavigationRowActions(item.id, onChanged);

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className={styles.childWrapper}>
      <details className={styles.childCard}>
        <summary className={styles.childSummary}>
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            className={styles.dragHandle}
            aria-label="Drag to reorder"
          >
            <LuGripVertical className={styles.dragIcon} />
          </button>
          <span className={styles.summaryText}>
            <span className={styles.primary}>{item.label}</span>
            <span className={styles.secondary}>{item.href}</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={pending}
            aria-label="Delete"
          >
            <LuTrash2 />
          </Button>
        </summary>
        <div className={styles.childBody}>
          <LinkForm idPrefix={item.id} initial={item} submitLabel="Save" pending={pending} onSubmit={handleUpdate} />
        </div>
      </details>
    </Reorder.Item>
  );
}

function NavigationItemCard({
  item,
  locale,
  onChanged,
}: {
  item: NavigationItemWithChildren;
  locale: AppLocale;
  onChanged: () => void;
}) {
  const controls = useDragControls();
  const { pending, handleUpdate, handleDelete } = useNavigationRowActions(item.id, onChanged);
  const [creatingChild, startCreatingChild] = useTransition();
  const [children, setChildren] = useState(item.children);
  const [createChildKey, setCreateChildKey] = useState(0);

  useEffect(() => setChildren(item.children), [item.children]);

  function handleCreateChild(values: { label: string; href: string }) {
    startCreatingChild(async () => {
      const result = await createNavigationItemAction({ ...values, parentId: item.id, locale });
      if (result.error) toast.error(result.error);
      else {
        toast.success("Added");
        setCreateChildKey((key) => key + 1);
        onChanged();
      }
    });
  }

  function handleReorderChildren(next: NavigationItemRow[]) {
    setChildren(next);
    void reorderNavigationItemAction(
      item.id,
      next.map((child) => child.id),
    ).then((result) => {
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className={styles.itemWrapper}>
      <details className={styles.itemCard}>
        <summary className={styles.itemSummary}>
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            className={styles.dragHandle}
            aria-label="Drag to reorder"
          >
            <LuGripVertical className={styles.dragIcon} />
          </button>
          <span className={styles.summaryText}>
            <span className={styles.primary}>{item.label}</span>
            <span className={styles.secondary}>{item.href}</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={pending}
            aria-label="Delete"
          >
            <LuTrash2 />
          </Button>
        </summary>
        <div className={styles.itemBody}>
          <LinkForm idPrefix={item.id} initial={item} submitLabel="Save" pending={pending} onSubmit={handleUpdate} />

          <div className={styles.childrenSection}>
            <span className={styles.childrenLabel}>Sub-links</span>
            {children.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={children}
                onReorder={handleReorderChildren}
                className={styles.childGroup}
              >
                {children.map((child) => (
                  <ChildRow key={child.id} item={child} onChanged={onChanged} />
                ))}
              </Reorder.Group>
            ) : (
              <p className={styles.empty}>No sub-links yet.</p>
            )}

            <details className={styles.createChildDisclosure}>
              <summary className={styles.createTrigger}>
                <LuPlus className={styles.createIcon} />
                Add sub-link
              </summary>
              <div className={styles.createBody}>
                <LinkForm
                  key={createChildKey}
                  idPrefix={`${item.id}-new-child`}
                  initial={{ label: "", href: "" }}
                  submitLabel="Add"
                  pending={creatingChild}
                  onSubmit={handleCreateChild}
                />
              </div>
            </details>
          </div>
        </div>
      </details>
    </Reorder.Item>
  );
}

export function NavigationManager({
  items,
  locale,
}: {
  items: NavigationItemWithChildren[];
  locale: AppLocale;
}) {
  const router = useRouter();
  const [orderedItems, setOrderedItems] = useState(items);
  const [creating, startCreating] = useTransition();
  const [copying, startCopying] = useTransition();
  const [createKey, setCreateKey] = useState(0);

  useEffect(() => setOrderedItems(items), [items]);

  function refresh() {
    router.refresh();
  }

  function handleReorder(next: NavigationItemWithChildren[]) {
    setOrderedItems(next);
    void reorderNavigationItemAction(
      null,
      next.map((item) => item.id),
    ).then((result) => {
      if (result?.error) toast.error(result.error);
    });
  }

  function handleCopyDefault() {
    startCopying(async () => {
      const result = await copyNavigationFromDefaultAction(locale);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Links copied — translate the labels");
        router.refresh();
      }
    });
  }

  function handleCreate(values: { label: string; href: string }) {
    startCreating(async () => {
      const result = await createNavigationItemAction({ ...values, locale });
      if (result.error) toast.error(result.error);
      else {
        toast.success("Added");
        setCreateKey((key) => key + 1);
        router.refresh();
      }
    });
  }

  return (
    <div className={styles.list}>
      {orderedItems.length > 0 ? (
        <Reorder.Group axis="y" values={orderedItems} onReorder={handleReorder} className={styles.group}>
          {orderedItems.map((item) => (
            <NavigationItemCard key={item.id} item={item} locale={locale} onChanged={refresh} />
          ))}
        </Reorder.Group>
      ) : null}
      {orderedItems.length === 0 ? (
        <p className={styles.empty}>
          {locale === DEFAULT_LOCALE
            ? "No nav links yet — using auto-generated section links."
            : `No ${LOCALE_META[locale].nativeName} nav links yet — the ${LOCALE_META[DEFAULT_LOCALE].nativeName} links (or auto-generated section links) are shown instead.`}
        </p>
      ) : null}
      {orderedItems.length === 0 && locale !== DEFAULT_LOCALE ? (
        <Button type="button" variant="outline" size="sm" onClick={handleCopyDefault} disabled={copying}>
          {copying ? <LuLoaderCircle className={styles.spinner} /> : <LuCopy />}
          Copy links from {LOCALE_META[DEFAULT_LOCALE].nativeName}
        </Button>
      ) : null}

      <details className={styles.createDisclosure}>
        <summary className={styles.createTrigger}>
          <LuPlus className={styles.createIcon} />
          Add link
        </summary>
        <div className={styles.createBody}>
          <LinkForm
            key={createKey}
            idPrefix="new"
            initial={{ label: "", href: "" }}
            submitLabel="Add"
            pending={creating}
            onSubmit={handleCreate}
          />
        </div>
      </details>
    </div>
  );
}
