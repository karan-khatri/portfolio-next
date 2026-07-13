import { prisma } from "./client";

export interface SiteSettingsValues {
  title: string;
  description: string;
}

// Ships with zero migration risk: no SiteSetting rows need to exist yet,
// these are exactly today's hardcoded values in app/layout.tsx.
const DEFAULTS: SiteSettingsValues = {
  title: "Portfolio",
  description: "Portfolio site",
};

const TITLE_KEY = "site.title";
const DESCRIPTION_KEY = "site.description";

export async function getSiteSettings(): Promise<SiteSettingsValues> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [TITLE_KEY, DESCRIPTION_KEY] } },
  });
  const byKey = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    title: typeof byKey[TITLE_KEY] === "string" ? (byKey[TITLE_KEY] as string) : DEFAULTS.title,
    description:
      typeof byKey[DESCRIPTION_KEY] === "string"
        ? (byKey[DESCRIPTION_KEY] as string)
        : DEFAULTS.description,
  };
}

export async function upsertSiteSettings(values: SiteSettingsValues): Promise<void> {
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: TITLE_KEY },
      update: { value: values.title },
      create: { key: TITLE_KEY, value: values.title },
    }),
    prisma.siteSetting.upsert({
      where: { key: DESCRIPTION_KEY },
      update: { value: values.description },
      create: { key: DESCRIPTION_KEY, value: values.description },
    }),
  ]);
}
