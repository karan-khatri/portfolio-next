import type { ServicesContent } from "@portfolio/sections";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";

export interface ServiceListItem {
  id: string;
  title: string;
  description: string | null;
}

export function ServicesSection({
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: ServicesContent;
  headingLevel: 2 | 3;
  items: ServiceListItem[];
}) {
  return (
    <SectionShell
      eyebrow="Services"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {items.length === 0 ? (
        <EmptyState message="No services listed yet." />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.id}>
              <Reveal delay={Math.min(index * 0.05, 0.3)} className="border border-border p-6">
                <span className="font-mono text-2xl text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
