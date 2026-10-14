import type { ProjectsContent } from "@portfolio/sections";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { ProjectCard, type ProjectCardItem } from "./project-card";
import { ProjectSlider } from "./project-slider";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export type ProjectListItem = ProjectCardItem;

export function ProjectsSection({
  locale,
  id,
  content,
  headingLevel,
  items,
}: {
  locale: AppLocale;
  id: string;
  content: ProjectsContent;
  headingLevel: 1 | 2 | 3;
  items: ProjectListItem[];
}) {
  const t = getDictionary(locale);
  const emptyMessage =
    content.displayMode === "list" ? t.empty.projects : t.empty.featuredProjects;

  return (
    <SectionShell
      eyebrow={t.eyebrow.projects}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : content.displayMode === "slider" ? (
        <ProjectSlider locale={locale} items={items} />
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <li key={project.id}>
              <ProjectCard locale={locale} project={project} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
