import { prisma, getSiteSettings, type SiteSettingsValues } from "@portfolio/db/server";
import { getSectionNavItems, type SectionNavItem } from "@/components/sections/section-renderer";
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n/config";

async function loadConfiguredNav(locale: AppLocale) {
  return prisma.navigationItem.findMany({
    where: { locale, parentId: null },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
}

export async function getPublicNav(locale: AppLocale = DEFAULT_LOCALE): Promise<{
  navItems: SectionNavItem[];
  settings: SiteSettingsValues;
}> {
  const settingsPromise = getSiteSettings(locale);

  let configuredNav = await loadConfiguredNav(locale);
  if (configuredNav.length === 0 && locale !== DEFAULT_LOCALE) {
    configuredNav = await loadConfiguredNav(DEFAULT_LOCALE);
  }

  const settings = await settingsPromise;

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

  const homePage =
    (await prisma.page.findFirst({
      where: { slug: "home", locale, status: "PUBLISHED" },
      include: { sections: true },
    })) ??
    (locale !== DEFAULT_LOCALE
      ? await prisma.page.findFirst({
          where: { slug: "home", locale: DEFAULT_LOCALE, status: "PUBLISHED" },
          include: { sections: true },
        })
      : null);

  return {
    navItems: homePage ? getSectionNavItems(homePage.sections) : [],
    settings,
  };
}
