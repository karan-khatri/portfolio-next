import type { SkillsContent } from "@portfolio/sections";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

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

function SkillBadgeList({ items }: { items: SkillListItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item.id} variant="outline" className="rounded-none font-mono text-xs tracking-wide uppercase">
          {item.name}
        </Badge>
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

  return (
    <SectionShell
      eyebrow="Skills"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {items.length === 0 ? (
        <EmptyState message="No skills listed yet." />
      ) : (
        <Reveal className="space-y-6">
          {ungrouped.length > 0 ? <SkillBadgeList items={ungrouped} /> : null}
          {[...grouped.entries()].map(([category, categoryItems]) => (
            <div key={category}>
              <span className="mb-2 block font-mono text-xs text-muted-foreground uppercase">
                {category}
              </span>
              <SkillBadgeList items={categoryItems} />
            </div>
          ))}
        </Reveal>
      )}
    </SectionShell>
  );
}
