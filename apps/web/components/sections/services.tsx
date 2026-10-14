import type { ServicesContent } from "@portfolio/sections";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

export interface ServiceListItem {
  id: string;
  title: string;
  description: string | null;
}

export function ServicesSection({
  locale,
  id,
  content,
  headingLevel,
  items,
}: {
  locale: AppLocale;
  id: string;
  content: ServicesContent;
  headingLevel: 1 | 2 | 3;
  items: ServiceListItem[];
}) {
  const t = getDictionary(locale);

  return (
    <SectionShell
      eyebrow={t.eyebrow.services}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message={t.empty.services} />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.id}>
                <div className="glass-panel glow-primary h-full rounded-xl p-6 transition-all duration-300">
                  <span className="font-mono text-xs text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-heading mt-3 text-lg font-medium">{item.title}</p>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
