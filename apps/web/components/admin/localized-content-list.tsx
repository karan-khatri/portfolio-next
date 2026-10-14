"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";
import { LuGripVertical, LuLoaderCircle, LuPlus, LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  FieldControl,
  serializeFieldValue,
  toInputValue,
  type FieldValue,
} from "@/components/admin/simple-content-list";
import {
  deleteLocalizedGroupAction,
  reorderLocalizedGroupsAction,
  saveLocalizedGroupAction,
} from "@/app/admin/(protected)/localized-list-actions";
import { simpleContentSummaries, type SimpleContentType, type SimpleField } from "@/lib/admin/simple-content-fields";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import listStyles from "./simple-content-list.module.scss";
import styles from "./localized-content-list.module.scss";

type FieldMap = Record<string, unknown>;

export interface LocalizedGroupItem {
  groupId: string;
  order: number;
  shared: FieldMap;
  translations: Partial<Record<AppLocale, FieldMap>>;
}

type Values = Record<string, FieldValue>;

function initialValues(fields: SimpleField[], source: FieldMap | undefined): Values {
  return Object.fromEntries(fields.map((field) => [field.key, toInputValue(field, source?.[field.key])]));
}

function serialize(fields: SimpleField[], values: Values): FieldMap {
  return Object.fromEntries(fields.map((field) => [field.key, serializeFieldValue(field, values[field.key])]));
}

function GroupForm({
  idPrefix,
  sharedFields,
  translatedFields,
  group,
  submitLabel,
  pending,
  onSubmit,
}: {
  idPrefix: string;
  sharedFields: SimpleField[];
  translatedFields: SimpleField[];
  group: LocalizedGroupItem | null;
  submitLabel: string;
  pending: boolean;
  onSubmit: (payload: { shared: FieldMap; translations: Record<string, FieldMap> }) => void;
}) {
  const [shared, setShared] = useState<Values>(() => initialValues(sharedFields, group?.shared));
  const [translations, setTranslations] = useState<Record<string, Values>>(() =>
    Object.fromEntries(LOCALES.map((locale) => [locale, initialValues(translatedFields, group?.translations[locale])])),
  );

  function setTranslated(locale: AppLocale, key: string, value: FieldValue) {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      shared: serialize(sharedFields, shared),
      translations: Object.fromEntries(
        LOCALES.map((locale) => [locale, serialize(translatedFields, translations[locale])]),
      ),
    });
  }

  return (
    <form onSubmit={handleSubmit} className={listStyles.form}>
      {sharedFields.length > 0 ? (
        <div className={styles.sharedBlock}>
          <span className={styles.blockLabel}>Same in every language</span>
          <div className={listStyles.fieldGrid}>
            {sharedFields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                fieldId={`${idPrefix}-shared-${field.key}`}
                value={shared[field.key]}
                onChange={(next) => setShared((prev) => ({ ...prev, [field.key]: next }))}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.localeGrid}>
        {LOCALES.map((locale) => {
          const isDefault = locale === DEFAULT_LOCALE;
          return (
            <fieldset key={locale} className={styles.localeBlock}>
              <legend className={styles.localeLegend}>
                {LOCALE_META[locale].nativeName}
                <span className={styles.localeCode}>{locale}</span>
                {!isDefault ? <span className={styles.optional}>optional</span> : null}
              </legend>
              {!isDefault ? (
                <p className={styles.localeHint}>
                  Leave empty to show the {LOCALE_META[DEFAULT_LOCALE].nativeName} text on the {LOCALE_META[locale].nativeName} site.
                </p>
              ) : null}
              <div className={styles.localeFields}>
                {translatedFields.map((field) => (
                  <FieldControl
                    key={field.key}
                    field={{ ...field, required: isDefault ? field.required : false }}
                    fieldId={`${idPrefix}-${locale}-${field.key}`}
                    value={translations[locale][field.key]}
                    onChange={(next) => setTranslated(locale, field.key, next)}
                  />
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <LuLoaderCircle className={listStyles.spinner} /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}

function GroupRow({
  listKey,
  contentType,
  group,
  sharedFields,
  translatedFields,
}: {
  listKey: string;
  contentType: SimpleContentType;
  group: LocalizedGroupItem;
  sharedFields: SimpleField[];
  translatedFields: SimpleField[];
}) {
  const router = useRouter();
  const controls = useDragControls();
  const [pending, startTransition] = useTransition();

  const primaryLocale = group.translations[DEFAULT_LOCALE]
    ? DEFAULT_LOCALE
    : (LOCALES.find((locale) => group.translations[locale]) ?? DEFAULT_LOCALE);
  const { primary, secondary } = simpleContentSummaries[contentType]({
    ...group.shared,
    ...group.translations[primaryLocale],
  });
  const available = LOCALES.filter((locale) => group.translations[locale]);

  function handleSave(payload: { shared: FieldMap; translations: Record<string, FieldMap> }) {
    startTransition(async () => {
      const result = await saveLocalizedGroupAction(listKey, group.groupId, payload);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Saved");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLocalizedGroupAction(listKey, group.groupId);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  return (
    <Reorder.Item value={group} dragListener={false} dragControls={controls} className={listStyles.itemWrapper}>
      <details className={listStyles.itemCard}>
        <summary className={listStyles.itemSummary}>
          <button
            type="button"
            onPointerDown={(event) => controls.start(event)}
            className={listStyles.dragHandle}
            aria-label="Drag to reorder"
          >
            <LuGripVertical className={listStyles.dragIcon} />
          </button>
          <span className={listStyles.summaryText}>
            <span className={listStyles.primary}>{primary}</span>
            {secondary ? <span className={listStyles.secondary}>{secondary}</span> : null}
          </span>
          <span className={styles.localeChips} aria-label="Languages with content">
            {LOCALES.map((locale) => (
              <span key={locale} className={styles.chip} data-present={available.includes(locale)}>
                {locale}
              </span>
            ))}
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
        <div className={listStyles.itemBody}>
          <GroupForm
            idPrefix={group.groupId}
            sharedFields={sharedFields}
            translatedFields={translatedFields}
            group={group}
            submitLabel="Save"
            pending={pending}
            onSubmit={handleSave}
          />
        </div>
      </details>
    </Reorder.Item>
  );
}

export function LocalizedContentList({
  listKey,
  contentType,
  groups,
  sharedFields,
  translatedFields,
  emptyLabel,
}: {
  listKey: string;
  contentType: SimpleContentType;
  groups: LocalizedGroupItem[];
  sharedFields: SimpleField[];
  translatedFields: SimpleField[];
  emptyLabel: string;
}) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(groups);
  const [creating, startCreating] = useTransition();
  const [createKey, setCreateKey] = useState(0);

  useEffect(() => {
    setOrdered(groups);
  }, [groups]);

  function handleReorder(next: LocalizedGroupItem[]) {
    setOrdered(next);
    void reorderLocalizedGroupsAction(
      listKey,
      next.map((group) => group.groupId),
    ).then((result) => {
      if (result?.error) toast.error(result.error);
    });
  }

  function handleCreate(payload: { shared: FieldMap; translations: Record<string, FieldMap> }) {
    startCreating(async () => {
      const result = await saveLocalizedGroupAction(listKey, null, payload);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Added");
        setCreateKey((key) => key + 1);
        router.refresh();
      }
    });
  }

  return (
    <div className={listStyles.list}>
      <Reorder.Group axis="y" values={ordered} onReorder={handleReorder} className={listStyles.group}>
        {ordered.map((group) => (
          <GroupRow
            key={group.groupId}
            listKey={listKey}
            contentType={contentType}
            group={group}
            sharedFields={sharedFields}
            translatedFields={translatedFields}
          />
        ))}
      </Reorder.Group>
      {ordered.length === 0 ? <p className={listStyles.empty}>{emptyLabel}</p> : null}

      <details className={listStyles.createDisclosure}>
        <summary className={listStyles.createTrigger}>
          <LuPlus className={listStyles.createIcon} />
          Add new
        </summary>
        <div className={listStyles.createBody}>
          <GroupForm
            key={createKey}
            idPrefix="new"
            sharedFields={sharedFields}
            translatedFields={translatedFields}
            group={null}
            submitLabel="Add"
            pending={creating}
            onSubmit={handleCreate}
          />
        </div>
      </details>
    </div>
  );
}
