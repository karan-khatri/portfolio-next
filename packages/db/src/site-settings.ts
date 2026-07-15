import { prisma } from "./client";

export interface SiteSettingsValues {
  title: string;
  description: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
}

const DEFAULTS: SiteSettingsValues = {
  title: "Portfolio",
  description: "Portfolio site",
  githubUrl: null,
  linkedinUrl: null,
  resumeUrl: null,
};

const TITLE_KEY = "site.title";
const DESCRIPTION_KEY = "site.description";
const GITHUB_KEY = "site.social.github";
const LINKEDIN_KEY = "site.social.linkedin";
const RESUME_KEY = "site.resumeUrl";

const ALL_KEYS = [TITLE_KEY, DESCRIPTION_KEY, GITHUB_KEY, LINKEDIN_KEY, RESUME_KEY];

function readString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

export async function getSiteSettings(): Promise<SiteSettingsValues> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ALL_KEYS } } });
  const byKey = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    title: readString(byKey[TITLE_KEY]) ?? DEFAULTS.title,
    description: readString(byKey[DESCRIPTION_KEY]) ?? DEFAULTS.description,
    githubUrl: readString(byKey[GITHUB_KEY]),
    linkedinUrl: readString(byKey[LINKEDIN_KEY]),
    resumeUrl: readString(byKey[RESUME_KEY]),
  };
}

export async function upsertSiteSettings(values: SiteSettingsValues): Promise<void> {
  const entries: [string, string][] = [
    [TITLE_KEY, values.title],
    [DESCRIPTION_KEY, values.description],
    [GITHUB_KEY, values.githubUrl ?? ""],
    [LINKEDIN_KEY, values.linkedinUrl ?? ""],
    [RESUME_KEY, values.resumeUrl ?? ""],
  ];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}
