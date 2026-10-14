import "server-only";
import { randomUUID } from "node:crypto";
import { prisma, type Locale } from "@portfolio/db/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

import type { LocalizedListKey } from "@/lib/admin/simple-content-fields";

export type { LocalizedListKey };

export type FieldMap = Record<string, unknown>;

export interface LocalizedGroup {
  groupId: string;
  order: number;
  shared: FieldMap;
  translations: Partial<Record<Locale, FieldMap>>;
}

interface Row extends FieldMap {
  id: string;
  locale: Locale;
  translationGroupId: string;
  order: number;
}

interface ListDefinition {
  sharedFields: string[];
  translatedFields: string[];
  requiredTranslated: string[];
  loadRows: () => Promise<Row[]>;
  upsert: (groupId: string, locale: Locale, shared: FieldMap, translated: FieldMap, order: number) => Promise<unknown>;
  removeLocale: (groupId: string, locale: Locale) => Promise<unknown>;
  removeGroup: (groupId: string) => Promise<unknown>;
  setOrder: (groupId: string, order: number) => Promise<unknown>;
  updateShared: (groupId: string, shared: FieldMap) => Promise<unknown>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function textOrNull(value: unknown): string | null {
  const trimmed = text(value);
  return trimmed === "" ? null : trimmed;
}

function dateOrNull(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  return null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

const experience: ListDefinition = {
  sharedFields: ["startDate", "endDate"],
  translatedFields: ["company", "title", "description"],
  requiredTranslated: ["company", "title"],
  loadRows: () => prisma.experience.findMany({ orderBy: { order: "asc" } }),
  upsert: (groupId, locale, shared, translated, order) => {
    const data = {
      company: text(translated.company),
      title: text(translated.title),
      description: textOrNull(translated.description),
      startDate: dateOrNull(shared.startDate) ?? new Date(),
      endDate: dateOrNull(shared.endDate),
      order,
    };
    return prisma.experience.upsert({
      where: { translationGroupId_locale: { translationGroupId: groupId, locale } },
      create: { ...data, translationGroupId: groupId, locale },
      update: data,
    });
  },
  removeLocale: (groupId, locale) =>
    prisma.experience.deleteMany({ where: { translationGroupId: groupId, locale } }),
  removeGroup: (groupId) => prisma.experience.deleteMany({ where: { translationGroupId: groupId } }),
  setOrder: (groupId, order) =>
    prisma.experience.updateMany({ where: { translationGroupId: groupId }, data: { order } }),
  updateShared: (groupId, shared) =>
    prisma.experience.updateMany({
      where: { translationGroupId: groupId },
      data: { startDate: dateOrNull(shared.startDate) ?? new Date(), endDate: dateOrNull(shared.endDate) },
    }),
};

const education: ListDefinition = {
  sharedFields: ["startDate", "endDate"],
  translatedFields: ["institution", "degree", "location", "description"],
  requiredTranslated: ["institution", "degree"],
  loadRows: () => prisma.education.findMany({ orderBy: { order: "asc" } }),
  upsert: (groupId, locale, shared, translated, order) => {
    const data = {
      institution: text(translated.institution),
      degree: text(translated.degree),
      location: textOrNull(translated.location),
      description: textOrNull(translated.description),
      startDate: dateOrNull(shared.startDate) ?? new Date(),
      endDate: dateOrNull(shared.endDate),
      order,
    };
    return prisma.education.upsert({
      where: { translationGroupId_locale: { translationGroupId: groupId, locale } },
      create: { ...data, translationGroupId: groupId, locale },
      update: data,
    });
  },
  removeLocale: (groupId, locale) =>
    prisma.education.deleteMany({ where: { translationGroupId: groupId, locale } }),
  removeGroup: (groupId) => prisma.education.deleteMany({ where: { translationGroupId: groupId } }),
  setOrder: (groupId, order) =>
    prisma.education.updateMany({ where: { translationGroupId: groupId }, data: { order } }),
  updateShared: (groupId, shared) =>
    prisma.education.updateMany({
      where: { translationGroupId: groupId },
      data: { startDate: dateOrNull(shared.startDate) ?? new Date(), endDate: dateOrNull(shared.endDate) },
    }),
};

const skill: ListDefinition = {
  sharedFields: ["level"],
  translatedFields: ["name", "category"],
  requiredTranslated: ["name"],
  loadRows: () => prisma.skill.findMany({ orderBy: { order: "asc" } }),
  upsert: (groupId, locale, shared, translated, order) => {
    const data = {
      name: text(translated.name),
      category: textOrNull(translated.category),
      level: numberOrNull(shared.level),
      order,
    };
    return prisma.skill.upsert({
      where: { translationGroupId_locale: { translationGroupId: groupId, locale } },
      create: { ...data, translationGroupId: groupId, locale },
      update: data,
    });
  },
  removeLocale: (groupId, locale) =>
    prisma.skill.deleteMany({ where: { translationGroupId: groupId, locale } }),
  removeGroup: (groupId) => prisma.skill.deleteMany({ where: { translationGroupId: groupId } }),
  setOrder: (groupId, order) =>
    prisma.skill.updateMany({ where: { translationGroupId: groupId }, data: { order } }),
  updateShared: (groupId, shared) =>
    prisma.skill.updateMany({ where: { translationGroupId: groupId }, data: { level: numberOrNull(shared.level) } }),
};

const language: ListDefinition = {
  sharedFields: [],
  translatedFields: ["name", "proficiency"],
  requiredTranslated: ["name", "proficiency"],
  loadRows: () => prisma.language.findMany({ orderBy: { order: "asc" } }),
  upsert: (groupId, locale, _shared, translated, order) => {
    const data = { name: text(translated.name), proficiency: text(translated.proficiency), order };
    return prisma.language.upsert({
      where: { translationGroupId_locale: { translationGroupId: groupId, locale } },
      create: { ...data, translationGroupId: groupId, locale },
      update: data,
    });
  },
  removeLocale: (groupId, locale) =>
    prisma.language.deleteMany({ where: { translationGroupId: groupId, locale } }),
  removeGroup: (groupId) => prisma.language.deleteMany({ where: { translationGroupId: groupId } }),
  setOrder: (groupId, order) =>
    prisma.language.updateMany({ where: { translationGroupId: groupId }, data: { order } }),
  updateShared: async () => undefined,
};

const service: ListDefinition = {
  sharedFields: [],
  translatedFields: ["title", "description"],
  requiredTranslated: ["title"],
  loadRows: () => prisma.service.findMany({ orderBy: { order: "asc" } }),
  upsert: (groupId, locale, _shared, translated, order) => {
    const data = { title: text(translated.title), description: textOrNull(translated.description), order };
    return prisma.service.upsert({
      where: { translationGroupId_locale: { translationGroupId: groupId, locale } },
      create: { ...data, translationGroupId: groupId, locale },
      update: data,
    });
  },
  removeLocale: (groupId, locale) =>
    prisma.service.deleteMany({ where: { translationGroupId: groupId, locale } }),
  removeGroup: (groupId) => prisma.service.deleteMany({ where: { translationGroupId: groupId } }),
  setOrder: (groupId, order) =>
    prisma.service.updateMany({ where: { translationGroupId: groupId }, data: { order } }),
  updateShared: async () => undefined,
};

const testimonial: ListDefinition = {
  sharedFields: ["authorName", "avatarUrl"],
  translatedFields: ["authorRole", "quote"],
  requiredTranslated: ["quote"],
  loadRows: () => prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
  upsert: (groupId, locale, shared, translated, order) => {
    const data = {
      authorName: text(shared.authorName),
      avatarUrl: textOrNull(shared.avatarUrl),
      authorRole: textOrNull(translated.authorRole),
      quote: text(translated.quote),
      order,
    };
    return prisma.testimonial.upsert({
      where: { translationGroupId_locale: { translationGroupId: groupId, locale } },
      create: { ...data, translationGroupId: groupId, locale },
      update: data,
    });
  },
  removeLocale: (groupId, locale) =>
    prisma.testimonial.deleteMany({ where: { translationGroupId: groupId, locale } }),
  removeGroup: (groupId) => prisma.testimonial.deleteMany({ where: { translationGroupId: groupId } }),
  setOrder: (groupId, order) =>
    prisma.testimonial.updateMany({ where: { translationGroupId: groupId }, data: { order } }),
  updateShared: (groupId, shared) =>
    prisma.testimonial.updateMany({
      where: { translationGroupId: groupId },
      data: { authorName: text(shared.authorName), avatarUrl: textOrNull(shared.avatarUrl) },
    }),
};

export const LOCALIZED_LISTS: Record<LocalizedListKey, ListDefinition> = {
  experience,
  education,
  skill,
  language,
  service,
  testimonial,
};

export function isLocalizedListKey(value: string): value is LocalizedListKey {
  return value in LOCALIZED_LISTS;
}

function pickFields(source: FieldMap, keys: string[]): FieldMap {
  return Object.fromEntries(keys.map((key) => [key, source[key] ?? null]));
}

export async function loadLocalizedGroups(key: LocalizedListKey): Promise<LocalizedGroup[]> {
  const definition = LOCALIZED_LISTS[key];
  const rows = await definition.loadRows();

  const byGroup = new Map<string, Row[]>();
  for (const row of rows) {
    byGroup.set(row.translationGroupId, [...(byGroup.get(row.translationGroupId) ?? []), row]);
  }

  return [...byGroup.entries()]
    .map(([groupId, groupRows]) => {
      const primary = groupRows.find((row) => row.locale === DEFAULT_LOCALE) ?? groupRows[0];
      return {
        groupId,
        order: Math.min(...groupRows.map((row) => row.order)),
        shared: pickFields(primary, definition.sharedFields),
        translations: Object.fromEntries(
          groupRows.map((row) => [row.locale, pickFields(row, definition.translatedFields)]),
        ) as Partial<Record<Locale, FieldMap>>,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export async function countGroups(key: LocalizedListKey): Promise<number> {
  const rows = await LOCALIZED_LISTS[key].loadRows();
  return new Set(rows.map((row) => row.translationGroupId)).size;
}

export interface SaveGroupInput {
  shared: FieldMap;
  translations: Record<string, FieldMap | null | undefined>;
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

export function validateGroupInput(key: LocalizedListKey, input: SaveGroupInput): string | null {
  const definition = LOCALIZED_LISTS[key];

  for (const locale of LOCALES) {
    const values = input.translations[locale];
    const hasContent = values ? definition.translatedFields.some((field) => !isBlank(values[field])) : false;

    if (locale === DEFAULT_LOCALE && !hasContent) {
      return `The ${DEFAULT_LOCALE.toUpperCase()} (default language) entry is required.`;
    }
    if (hasContent && values) {
      const missing = definition.requiredTranslated.filter((field) => isBlank(values[field]));
      if (missing.length > 0) {
        return `${locale.toUpperCase()}: please fill in ${missing.join(", ")} or clear every ${locale.toUpperCase()} field.`;
      }
    }
  }
  return null;
}

export async function saveGroup(
  key: LocalizedListKey,
  groupId: string | null,
  input: SaveGroupInput,
): Promise<string> {
  const definition = LOCALIZED_LISTS[key];
  const id = groupId ?? randomUUID();
  const existing = groupId ? (await loadLocalizedGroups(key)).find((group) => group.groupId === id) : null;
  const order = existing?.order ?? (await countGroups(key));

  for (const locale of LOCALES) {
    const values = input.translations[locale];
    const hasContent = values ? definition.translatedFields.some((field) => !isBlank(values[field])) : false;
    if (hasContent && values) {
      await definition.upsert(id, locale, input.shared, values, order);
    } else {
      await definition.removeLocale(id, locale);
    }
  }
  await definition.updateShared(id, input.shared);
  return id;
}
