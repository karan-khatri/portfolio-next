import { prisma, SectionType, getSiteSettings, type Locale } from "@portfolio/db/server";
import { sectionRegistry } from "@portfolio/sections";
import {
  localesToQuery,
  pickFeaturedLocalized,
  pickLocalized,
  pickLocalizedList,
} from "@/lib/i18n/content";
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

// Every section schema in packages/sections/src/schemas.ts declares this
// field the same way (`heading: z.string().min(1)`) — used only for the
// nav-anchor slug and the wrapping <section>'s aria-label, neither of which
// needs the section's full, specific content type.
interface HasHeading {
  heading: string;
}

function slugifyHeading(heading: string, fallback: string): string {
  const slug = heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

async function resolveSectionImage(imageId: string | undefined) {
  if (!imageId) return null;
  const media = await prisma.media.findUnique({
    where: { id: imageId },
    select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
  });
  return media;
}

// Each case re-indexes sectionRegistry with the literal SectionType (not the
// widened `section.type` variable), so TypeScript narrows `def.schema` to
// that section's specific z.ZodType<TContent> and `content` comes back
// exactly typed — no `as never` needed anywhere below, and a schema/prop
// mismatch between the registry and a section component is a compile error
// again instead of silently passing through.
async function renderSection(section: RenderableSection, locale: Locale) {
  switch (section.type) {
    case SectionType.HERO: {
      const def = sectionRegistry[SectionType.HERO];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const image = await resolveSectionImage(content.imageId);
      const settings = await getSiteSettings(locale);
      return (
        <HeroSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          image={image}
          githubUrl={settings.githubUrl}
          linkedinUrl={settings.linkedinUrl}
        />
      );
    }
    case SectionType.ABOUT: {
      const def = sectionRegistry[SectionType.ABOUT];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const image = await resolveSectionImage(content.imageId);
      return (
        <AboutSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          image={image}
        />
      );
    }
    case SectionType.PROJECTS: {
      const def = sectionRegistry[SectionType.PROJECTS];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const isCuratedMode = content.displayMode === "featured" || content.displayMode === "slider";
      const rows = await prisma.project.findMany({
        where: isCuratedMode
          ? { locale: { in: localesToQuery(locale) }, status: "PUBLISHED" }
          : { locale: { in: localesToQuery(locale) }, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          codeRepository: true,
          liveUrl: true,
          locale: true,
          translationGroupId: true,
          featured: true,
          featuredOrder: true,
          publishedAt: true,
          coverImage: {
            select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
          },
          tags: { select: { name: true } },
        },
      });
      const ordered = isCuratedMode ? pickFeaturedLocalized(rows, locale) : pickLocalized(rows, locale);
      const projects = ordered.slice(0, content.limit ?? (isCuratedMode ? undefined : 6));
      return (
        <ProjectsSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={projects.map((project) => ({
            ...project,
            tags: project.tags.map((tag) => tag.name),
          }))}
        />
      );
    }
    case SectionType.EXPERIENCE: {
      const def = sectionRegistry[SectionType.EXPERIENCE];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const items = await prisma.experience.findMany({
        where: { locale: { in: localesToQuery(locale) } },
        orderBy: { order: "asc" },
        select: {
          id: true,
          company: true,
          title: true,
          startDate: true,
          endDate: true,
          description: true,
          locale: true,
          translationGroupId: true,
          order: true,
        },
      });
      return (
        <ExperienceSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={pickLocalizedList(items, locale)}
        />
      );
    }
    case SectionType.EDUCATION: {
      const def = sectionRegistry[SectionType.EDUCATION];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const items = await prisma.education.findMany({
        where: { locale: { in: localesToQuery(locale) } },
        orderBy: { order: "asc" },
        select: {
          id: true,
          institution: true,
          degree: true,
          location: true,
          startDate: true,
          endDate: true,
          description: true,
          locale: true,
          translationGroupId: true,
          order: true,
        },
      });
      return (
        <EducationSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={pickLocalizedList(items, locale)}
        />
      );
    }
    case SectionType.SKILLS: {
      const def = sectionRegistry[SectionType.SKILLS];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const items = await prisma.skill.findMany({
        where: { locale: { in: localesToQuery(locale) } },
        orderBy: { order: "asc" },
        select: { id: true, name: true, category: true, locale: true, translationGroupId: true, order: true },
      });
      const techStackItems = await prisma.techStackItem.findMany({
        orderBy: { order: "asc" },
        select: { id: true, name: true, imageUrl: true },
      });
      return (
        <SkillsSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={pickLocalizedList(items, locale)}
          techStackItems={techStackItems}
        />
      );
    }
    case SectionType.LANGUAGES: {
      const def = sectionRegistry[SectionType.LANGUAGES];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const items = await prisma.language.findMany({
        where: { locale: { in: localesToQuery(locale) } },
        orderBy: { order: "asc" },
        select: { id: true, name: true, proficiency: true, locale: true, translationGroupId: true, order: true },
      });
      return (
        <LanguagesSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={pickLocalizedList(items, locale)}
        />
      );
    }
    case SectionType.SERVICES: {
      const def = sectionRegistry[SectionType.SERVICES];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const items = await prisma.service.findMany({
        where: { locale: { in: localesToQuery(locale) } },
        orderBy: { order: "asc" },
        select: { id: true, title: true, description: true, locale: true, translationGroupId: true, order: true },
      });
      return (
        <ServicesSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={pickLocalizedList(items, locale)}
        />
      );
    }
    case SectionType.TESTIMONIALS: {
      const def = sectionRegistry[SectionType.TESTIMONIALS];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const items = await prisma.testimonial.findMany({
        where: { locale: { in: localesToQuery(locale) } },
        orderBy: { order: "asc" },
        select: {
          id: true,
          authorName: true,
          authorRole: true,
          quote: true,
          locale: true,
          translationGroupId: true,
          order: true,
        },
      });
      return (
        <TestimonialsSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={pickLocalizedList(items, locale)}
        />
      );
    }
    case SectionType.BLOG: {
      const def = sectionRegistry[SectionType.BLOG];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const postRows = await prisma.post.findMany({
        where: { locale: { in: localesToQuery(locale) }, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          locale: true,
          translationGroupId: true,
          publishedAt: true,
          coverImage: {
            select: { url: true, width: true, height: true, blurDataUrl: true, altText: true },
          },
        },
      });
      const posts = pickLocalized(postRows, locale).slice(0, content.limit ?? 3);
      return (
        <BlogSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          items={posts}
        />
      );
    }
    case SectionType.CONTACT: {
      const def = sectionRegistry[SectionType.CONTACT];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      const settings = await getSiteSettings(locale);
      return (
        <ContactSection
          locale={locale}
          id={headingId}
          content={content}
          headingLevel={def.headingLevel}
          githubUrl={settings.githubUrl}
          linkedinUrl={settings.linkedinUrl}
          upworkUrl={settings.upworkUrl}
          fiverrUrl={settings.fiverrUrl}
          instagramUrl={settings.instagramUrl}
          location={settings.location}
        />
      );
    }
    case SectionType.RESUME: {
      const def = sectionRegistry[SectionType.RESUME];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      return <ResumeSection locale={locale} id={headingId} content={content} headingLevel={def.headingLevel} />;
    }
    case SectionType.NOW: {
      const def = sectionRegistry[SectionType.NOW];
      const content = def.schema.parse(section.content);
      const headingId = slugifyHeading(content.heading, `section-${section.id}`);
      return <NowSection locale={locale} id={headingId} content={content} headingLevel={def.headingLevel} />;
    }
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
      const content = def.schema.parse(section.content) as HasHeading;
      const slug = slugifyHeading(content.heading, `section-${section.id}`);
      return { id: slug, label: content.heading, href: `#${slug}` };
    });
}

export async function SectionRenderer({
  sections,
  locale,
}: {
  sections: RenderableSection[];
  locale: Locale;
}) {
  const enabled = enabledSections(sections);

  const rendered = await Promise.all(
    enabled.map(async (section) => {
      const def = sectionRegistry[section.type];
      const content = def.schema.parse(section.content) as HasHeading;
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
