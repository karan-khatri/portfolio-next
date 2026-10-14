import type { LanguagesContent } from "@portfolio/sections";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

export interface LanguageListItem {
  id: string;
  name: string;
  proficiency: string;
}

export function LanguagesSection({
  locale,
  id,
  content,
  headingLevel,
  items,
}: {
  locale: AppLocale;
  id: string;
  content: LanguagesContent;
  headingLevel: 1 | 2 | 3;
  items: LanguageListItem[];
}) {
  const t = getDictionary(locale);

  return (
    <SectionShell
      eyebrow={t.eyebrow.languages}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message={t.empty.languages} />
      ) : (
        <div className="flex flex-wrap gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-panel glow-primary flex flex-col gap-1 rounded-lg px-4 py-3 transition-all duration-300"
            >
              <span className="font-mono text-sm text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.proficiency}</span>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
