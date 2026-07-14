import type { ProjectsContent } from "@portfolio/sections";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { ProjectCard, type ProjectCardItem } from "./project-card";

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
  return (
    <SectionShell
      eyebrow="Projects"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {items.length === 0 ? (
        <EmptyState message="No projects published yet." />
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((project, index) => (
            <li key={project.id}>
              <ProjectCard project={project} delay={Math.min(index * 0.05, 0.3)} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
