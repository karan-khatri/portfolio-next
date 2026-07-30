import { prisma } from "./client";
import { withUniqueRetry } from "./upsert-retry";

export interface SiteSettingsValues {
  title: string;
  description: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  upworkUrl: string | null;
  fiverrUrl: string | null;
  instagramUrl: string | null;
  resumeUrl: string | null;
  location: string | null;
}

const DEFAULTS: SiteSettingsValues = {
  title: "Portfolio",
  description: "Portfolio site",
  githubUrl: null,
  linkedinUrl: null,
  upworkUrl: null,
  fiverrUrl: null,
  instagramUrl: null,
  resumeUrl: null,
  location: null,
};

const TITLE_KEY = "site.title";
const DESCRIPTION_KEY = "site.description";
const GITHUB_KEY = "site.social.github";
const LINKEDIN_KEY = "site.social.linkedin";
const UPWORK_KEY = "site.social.upwork";
const FIVERR_KEY = "site.social.fiverr";
const INSTAGRAM_KEY = "site.social.instagram";
const RESUME_KEY = "site.resumeUrl";
const LOCATION_KEY = "site.location";

const ALL_KEYS = [
  TITLE_KEY,
  DESCRIPTION_KEY,
  GITHUB_KEY,
  LINKEDIN_KEY,
  UPWORK_KEY,
  FIVERR_KEY,
  INSTAGRAM_KEY,
  RESUME_KEY,
  LOCATION_KEY,
];

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
    upworkUrl: readString(byKey[UPWORK_KEY]),
    fiverrUrl: readString(byKey[FIVERR_KEY]),
    instagramUrl: readString(byKey[INSTAGRAM_KEY]),
    resumeUrl: readString(byKey[RESUME_KEY]),
    location: readString(byKey[LOCATION_KEY]),
  };
}

export async function upsertSiteSettings(values: SiteSettingsValues): Promise<void> {
  const entries: [string, string][] = [
    [TITLE_KEY, values.title],
    [DESCRIPTION_KEY, values.description],
    [GITHUB_KEY, values.githubUrl ?? ""],
    [LINKEDIN_KEY, values.linkedinUrl ?? ""],
    [UPWORK_KEY, values.upworkUrl ?? ""],
    [FIVERR_KEY, values.fiverrUrl ?? ""],
    [INSTAGRAM_KEY, values.instagramUrl ?? ""],
    [RESUME_KEY, values.resumeUrl ?? ""],
    [LOCATION_KEY, values.location ?? ""],
  ];

  await withUniqueRetry(() =>
    prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    ),
  );
}
