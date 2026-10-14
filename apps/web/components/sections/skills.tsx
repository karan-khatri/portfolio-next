import type { SkillsContent } from "@portfolio/sections";
import { TechMarquee, type TechMarqueeItem } from "@/components/tech-marquee";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { SkillsDiagram } from "./skills-diagram";

export interface SkillListItem {
  id: string;
  name: string;
  category: string | null;
}

function groupByCategory(items: SkillListItem[]) {
  const ungrouped: SkillListItem[] = [];
  const grouped = new Map<string, SkillListItem[]>();

  for (const item of items) {
    if (!item.category) {
      ungrouped.push(item);
      continue;
    }
    const existing = grouped.get(item.category) ?? [];
    existing.push(item);
    grouped.set(item.category, existing);
  }

  return { ungrouped, grouped };
}

function SkillTileList({ items }: { items: SkillListItem[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="glass-panel glow-primary rounded-lg px-4 py-3 font-mono text-sm text-foreground transition-all duration-300"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export function SkillsSection({
  locale,
  id,
  content,
  headingLevel,
  items,
  techStackItems,
}: {
  locale: AppLocale;
  id: string;
  content: SkillsContent;
  headingLevel: 1 | 2 | 3;
  items: SkillListItem[];
  techStackItems: TechMarqueeItem[];
}) {
  const t = getDictionary(locale);
  const { ungrouped, grouped } = groupByCategory(items);

  const diagramClusterItems = [
    content.diagramTopLeftItems,
    content.diagramBottomLeftItems,
    content.diagramTopRightItems,
    content.diagramBottomRightItems,
  ];
  const showDiagram = content.showDiagram && diagramClusterItems.some((cluster) => cluster.length > 0);

  return (
    <SectionShell
      eyebrow={t.eyebrow.stack}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      <TechMarquee items={techStackItems} />
      {showDiagram ? (
        <SkillsDiagram
          defaultCenterLabel={t.skills.techStack}
          centerLabel={content.diagramCenterLabel}
          centerSubtitle={content.diagramCenterSubtitle}
          topLeftTitle={content.diagramTopLeftTitle}
          topLeftItems={content.diagramTopLeftItems}
          bottomLeftTitle={content.diagramBottomLeftTitle}
          bottomLeftItems={content.diagramBottomLeftItems}
          topRightTitle={content.diagramTopRightTitle}
          topRightItems={content.diagramTopRightItems}
          bottomRightTitle={content.diagramBottomRightTitle}
          bottomRightItems={content.diagramBottomRightItems}
        />
      ) : items.length === 0 ? (
        <EmptyState message={t.empty.skills} />
      ) : (
        <div className="mt-10 space-y-8">
          {ungrouped.length > 0 ? <SkillTileList items={ungrouped} /> : null}
          {[...grouped.entries()].map(([category, categoryItems]) => (
            <div key={category} className="space-y-3">
              <span className="block font-mono text-xs tracking-wider text-muted-foreground uppercase">
                {category}
              </span>
              <SkillTileList items={categoryItems} />
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
