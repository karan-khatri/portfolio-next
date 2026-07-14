import { prisma, getSiteSettings, type SiteSettingsValues } from "@portfolio/db/server";
import { getSectionNavItems, type SectionNavItem } from "@/components/sections/section-renderer";

const LOCALE = "en";

// Shared by every public route (Home, Project/Post/Page detail) — the header
// nav always reflects either the configured NavigationItem list, or (when
// none is configured) Home's own section headings, regardless of which page
// is currently being viewed, so navigation never dead-ends on a detail page.
export async function getPublicNav(): Promise<{
  navItems: SectionNavItem[];
  settings: SiteSettingsValues;
}> {
  const [configuredNav, settings] = await Promise.all([
    prisma.navigationItem.findMany({
      where: { locale: LOCALE, parentId: null },
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    }),
    getSiteSettings(),
  ]);

  if (configuredNav.length > 0) {
    return {
      navItems: configuredNav.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        children: item.children.map((child) => ({
          id: child.id,
          label: child.label,
          href: child.href,
        })),
      })),
      settings,
    };
  }

  const homePage = await prisma.page.findFirst({
    where: { slug: "home", locale: LOCALE, status: "PUBLISHED" },
    include: { sections: true },
  });

  return {
    navItems: homePage ? getSectionNavItems(homePage.sections) : [],
    settings,
  };
}
