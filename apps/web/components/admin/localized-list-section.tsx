import { LocalizedContentList } from "@/components/admin/localized-content-list";
import { loadLocalizedGroups } from "@/lib/admin/localized-lists";
import { localizedListConfigs, type LocalizedListKey } from "@/lib/admin/simple-content-fields";

export async function LocalizedListSection({
  listKey,
  emptyLabel,
}: {
  listKey: LocalizedListKey;
  emptyLabel: string;
}) {
  const groups = await loadLocalizedGroups(listKey);
  const config = localizedListConfigs[listKey];

  return (
    <LocalizedContentList
      listKey={listKey}
      contentType={config.contentType}
      groups={groups}
      sharedFields={config.shared}
      translatedFields={config.translated}
      emptyLabel={emptyLabel}
    />
  );
}
