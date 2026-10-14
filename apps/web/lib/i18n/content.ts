import { DEFAULT_LOCALE, type AppLocale } from "./config";

interface Localized {
  translationGroupId: string;
  locale: AppLocale;
}

export type LocalizedLookup<T> =
  | { kind: "found"; row: T; isFallback: boolean }
  | { kind: "translated"; slug: string }
  | { kind: "missing" };

export async function resolveLocalized<T extends Localized>(
  locale: AppLocale,
  loadBySlug: (locale: AppLocale) => Promise<T | null>,
  findTranslationSlug: (groupId: string, locale: AppLocale) => Promise<string | null>,
): Promise<LocalizedLookup<T>> {
  const exact = await loadBySlug(locale);
  if (exact) return { kind: "found", row: exact, isFallback: false };
  if (locale === DEFAULT_LOCALE) return { kind: "missing" };

  const fallback = await loadBySlug(DEFAULT_LOCALE);
  if (!fallback) return { kind: "missing" };

  const translatedSlug = await findTranslationSlug(fallback.translationGroupId, locale);
  if (translatedSlug) return { kind: "translated", slug: translatedSlug };

  return { kind: "found", row: fallback, isFallback: true };
}

export function pickLocalized<T extends Localized & { publishedAt?: Date | null }>(
  rows: T[],
  locale: AppLocale,
): T[] {
  const byGroup = new Map<string, { chosen: T; orderKey: number }>();

  for (const row of rows) {
    const key = row.publishedAt ? row.publishedAt.getTime() : 0;
    const existing = byGroup.get(row.translationGroupId);

    if (!existing) {
      byGroup.set(row.translationGroupId, { chosen: row, orderKey: key });
      continue;
    }

    const chosen = row.locale === locale ? row : existing.chosen;
    const orderKey = row.locale === DEFAULT_LOCALE ? key : existing.orderKey;
    byGroup.set(row.translationGroupId, { chosen, orderKey });
  }

  return [...byGroup.values()].sort((a, b) => b.orderKey - a.orderKey).map((entry) => entry.chosen);
}

export function localesToQuery(locale: AppLocale): AppLocale[] {
  return locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];
}

export function pickFeaturedLocalized<
  T extends Localized & { featured: boolean; featuredOrder: number | null },
>(rows: T[], locale: AppLocale): T[] {
  const groups = new Map<string, { rows: T[]; order: number }>();

  for (const row of rows) {
    const group = groups.get(row.translationGroupId) ?? { rows: [], order: Number.POSITIVE_INFINITY };
    group.rows.push(row);
    if (row.featured && row.featuredOrder !== null) {
      group.order = Math.min(group.order, row.featuredOrder);
    }
    groups.set(row.translationGroupId, group);
  }

  return [...groups.values()]
    .filter((group) => Number.isFinite(group.order))
    .sort((a, b) => a.order - b.order)
    .map((group) => group.rows.find((row) => row.locale === locale) ?? group.rows[0]);
}

export function pickLocalizedList<T extends Localized & { order: number }>(
  rows: T[],
  locale: AppLocale,
): T[] {
  const byGroup = new Map<string, T>();

  for (const row of rows) {
    const existing = byGroup.get(row.translationGroupId);
    if (!existing || (row.locale === locale && existing.locale !== locale)) {
      byGroup.set(row.translationGroupId, row);
    }
  }

  return [...byGroup.values()].sort((a, b) => a.order - b.order);
}
