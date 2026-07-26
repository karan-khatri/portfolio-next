import type { SkillsContent } from "@portfolio/sections";
import { TechMarquee } from "@/components/tech-marquee";
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
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: SkillsContent;
  headingLevel: 2 | 3;
  items: SkillListItem[];
}) {
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
      eyebrow="Stack"
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      <TechMarquee />
      {showDiagram ? (
        <SkillsDiagram
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
        <EmptyState message="No skills listed yet." />
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
