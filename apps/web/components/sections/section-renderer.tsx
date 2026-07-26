import { prisma, SectionType, getSiteSettings } from "@portfolio/db/server";
import { sectionRegistry } from "@portfolio/sections";
import { HeroSection } from "./hero";
import { AboutSection } from "./about";
import { ProjectsSection } from "./projects";
import { ExperienceSection } from "./experience";
import { EducationSection } from "./education";
import { SkillsSection } from "./skills";
import { LanguagesSection } from "./languages";
import { ServicesSection } from "./services";
import { TestimonialsSection } from "./testimonials";
import { BlogSection } from "./blog";
import { ContactSection } from "./contact";
import { ResumeSection } from "./resume";
import { NowSection } from "./now";

export interface RenderableSection {
  id: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  content: unknown;
}

function slugifyHeading(heading: string, fallback: string): string {
  const slug = heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

async function resolveSectionImage(imageId: unknown) {
  if (typeof imageId !== "string" || !imageId) return null;
  const media = await prisma.media.findUnique({
    where: { id: imageId },
    select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
  });
  return media;
}

async function renderSection(section: RenderableSection, locale: string) {
  const def = sectionRegistry[section.type];
  const content = def.schema.parse(section.content);
  const headingId = slugifyHeading(
    (content as { heading: string }).heading,
    `section-${section.id}`,
  );
  const headingLevel = def.headingLevel;

  switch (section.type) {
    case SectionType.HERO: {
      const image = await resolveSectionImage((content as { imageId?: string }).imageId);
      return (
        <HeroSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          image={image}
        />
      );
    }
    case SectionType.ABOUT: {
      const image = await resolveSectionImage((content as { imageId?: string }).imageId);
      return (
        <AboutSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          image={image}
        />
      );
    }
    case SectionType.PROJECTS: {
      const typed = content as { limit?: number; displayMode?: "list" | "featured" | "slider" };
      const isCuratedMode = typed.displayMode === "featured" || typed.displayMode === "slider";
      const projects = await prisma.project.findMany({
        where: isCuratedMode
          ? { locale, status: "PUBLISHED", featured: true }
          : { locale, status: "PUBLISHED" },
        orderBy: isCuratedMode ? { featuredOrder: "asc" } : { publishedAt: "desc" },
        take: typed.limit ?? (isCuratedMode ? undefined : 6),
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          codeRepository: true,
          liveUrl: true,
          coverImage: {
            select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
          },
          tags: { select: { name: true } },
        },
      });
      return (
        <ProjectsSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={projects.map((project) => ({
            ...project,
            tags: project.tags.map((tag) => tag.name),
          }))}
        />
      );
    }
    case SectionType.EXPERIENCE: {
      const items = await prisma.experience.findMany({
        where: { locale },
        orderBy: { order: "asc" },
        select: {
          id: true,
          company: true,
          title: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      });
      return (
        <ExperienceSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={items}
        />
      );
    }
    case SectionType.EDUCATION: {
      const items = await prisma.education.findMany({
        where: { locale },
        orderBy: { order: "asc" },
        select: {
          id: true,
          institution: true,
          degree: true,
          location: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      });
      return (
        <EducationSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={items}
        />
      );
    }
    case SectionType.SKILLS: {
      const items = await prisma.skill.findMany({
        where: { locale },
        orderBy: { order: "asc" },
        select: { id: true, name: true, category: true },
      });
      const techStackItems = await prisma.techStackItem.findMany({
        orderBy: { order: "asc" },
        select: { id: true, name: true, imageUrl: true },
      });
      return (
        <SkillsSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={items}
          techStackItems={techStackItems}
        />
      );
    }
    case SectionType.LANGUAGES: {
      const items = await prisma.language.findMany({
        where: { locale },
        orderBy: { order: "asc" },
        select: { id: true, name: true, proficiency: true },
      });
      return (
        <LanguagesSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={items}
        />
      );
    }
    case SectionType.SERVICES: {
      const items = await prisma.service.findMany({
        where: { locale },
        orderBy: { order: "asc" },
        select: { id: true, title: true, description: true },
      });
      return (
        <ServicesSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={items}
        />
      );
    }
    case SectionType.TESTIMONIALS: {
      const items = await prisma.testimonial.findMany({
        where: { locale },
        orderBy: { order: "asc" },
        select: { id: true, authorName: true, authorRole: true, quote: true },
      });
      return (
        <TestimonialsSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={items}
        />
      );
    }
    case SectionType.BLOG: {
      const typed = content as { limit?: number };
      const posts = await prisma.post.findMany({
        where: { locale, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: typed.limit ?? 3,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: {
            select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
          },
        },
      });
      return (
        <BlogSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          items={posts}
        />
      );
    }
    case SectionType.CONTACT: {
      const settings = await getSiteSettings();
      return (
        <ContactSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
          githubUrl={settings.githubUrl}
          linkedinUrl={settings.linkedinUrl}
          upworkUrl={settings.upworkUrl}
          fiverrUrl={settings.fiverrUrl}
          instagramUrl={settings.instagramUrl}
          location={settings.location}
        />
      );
    }
    case SectionType.RESUME:
      return (
        <ResumeSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
        />
      );
    case SectionType.NOW:
      return (
        <NowSection
          id={headingId}
          content={content as never}
          headingLevel={headingLevel}
        />
      );
    default:
      return null;
  }
}

function enabledSections(sections: RenderableSection[]) {
  return sections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);
}

export interface SectionNavItem {
  id: string;
  label: string;
  href: string;
  children?: SectionNavItem[];
}

export function getSectionNavItems(sections: RenderableSection[]): SectionNavItem[] {
  return enabledSections(sections)
    .filter((section) => section.type !== SectionType.HERO)
    .map((section) => {
      const def = sectionRegistry[section.type];
      const content = def.schema.parse(section.content) as { heading: string };
      const slug = slugifyHeading(content.heading, `section-${section.id}`);
      return { id: slug, label: content.heading, href: `#${slug}` };
    });
}

export async function SectionRenderer({
  sections,
  locale,
}: {
  sections: RenderableSection[];
  locale: string;
}) {
  const enabled = enabledSections(sections);

  const rendered = await Promise.all(
    enabled.map(async (section) => {
      const def = sectionRegistry[section.type];
      const content = def.schema.parse(section.content) as { heading?: string };
      const body = await renderSection(section, locale);
      return (
        <section key={section.id} aria-label={content.heading} style={{ minHeight: def.minHeight }}>
          {body}
        </section>
      );
    }),
  );

  return <>{rendered}</>;
}
