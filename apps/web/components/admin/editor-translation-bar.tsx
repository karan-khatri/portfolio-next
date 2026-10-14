import type { EntityType } from "@portfolio/db/server";
import { TranslationBar } from "@/components/admin/translation-bar";
import { getTranslationSiblings } from "@/lib/admin/translations";
import type { AppLocale } from "@/lib/i18n/config";

export async function EditorTranslationBar({
  entityType,
  id,
  slug,
  locale,
  groupId,
}: {
  entityType: EntityType;
  id: string;
  slug: string;
  locale: AppLocale;
  groupId: string;
}) {
  const items = await getTranslationSiblings(entityType, groupId);

  return (
    <TranslationBar entityType={entityType} sourceId={id} sourceSlug={slug} current={locale} items={items} />
  );
}
