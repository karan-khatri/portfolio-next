import type { ProjectsContent } from "@portfolio/sections";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { ProjectCard, type ProjectCardItem } from "./project-card";
import { ProjectSlider } from "./project-slider";

export type ProjectListItem = ProjectCardItem;

export function ProjectsSection({
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: ProjectsContent;
  headingLevel: 2 | 3;
  items: ProjectListItem[];
}) {
  const emptyMessage =
    content.displayMode === "list" ? "No projects published yet." : "No featured projects yet.";

  return (
    <SectionShell
      eyebrow="Projects"
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
        <ProjectSlider items={items} />
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
