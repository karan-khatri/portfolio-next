import { prisma } from "./client";
import { DEFAULT_LOCALE, LOCALES } from "./locale";
import type { Locale } from "./generated/client";

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
  contactAutoReplyEnabled: boolean;
  contactAutoReplySubject: string;
  contactAutoReplyBody: string;
}

const DEFAULT_AUTO_REPLY_SUBJECT = "Thanks for reaching out";
const DEFAULT_AUTO_REPLY_BODY =
  "Hi {{name}},\n\nThanks for getting in touch — I've received your message and will get back to you soon.\n\nBest,\nKaran";

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
  contactAutoReplyEnabled: false,
  contactAutoReplySubject: DEFAULT_AUTO_REPLY_SUBJECT,
  contactAutoReplyBody: DEFAULT_AUTO_REPLY_BODY,
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
const AUTO_REPLY_ENABLED_KEY = "site.email.contactAutoReply.enabled";
const AUTO_REPLY_SUBJECT_KEY = "site.email.contactAutoReply.subject";
const AUTO_REPLY_BODY_KEY = "site.email.contactAutoReply.body";

const TRANSLATABLE_KEYS = {
  title: TITLE_KEY,
  description: DESCRIPTION_KEY,
  resumeUrl: RESUME_KEY,
  location: LOCATION_KEY,
  contactAutoReplySubject: AUTO_REPLY_SUBJECT_KEY,
  contactAutoReplyBody: AUTO_REPLY_BODY_KEY,
} as const;

export type TranslatableSettingKey = keyof typeof TRANSLATABLE_KEYS;

export type TranslatableSettings = Record<TranslatableSettingKey, string>;

export interface SharedSettings {
  githubUrl: string | null;
  linkedinUrl: string | null;
  upworkUrl: string | null;
  fiverrUrl: string | null;
  instagramUrl: string | null;
  contactAutoReplyEnabled: boolean;
}

export interface LocalizedSiteSettings {
  shared: SharedSettings;
  translations: Record<Locale, TranslatableSettings>;
}

const SHARED_KEYS = [
  GITHUB_KEY,
  LINKEDIN_KEY,
  UPWORK_KEY,
  FIVERR_KEY,
  INSTAGRAM_KEY,
  AUTO_REPLY_ENABLED_KEY,
];

const TRANSLATABLE_FIELDS = Object.keys(TRANSLATABLE_KEYS) as TranslatableSettingKey[];

function localizedKey(key: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? key : `${key}@${locale}`;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function allStoredKeys(): string[] {
  const translatable = Object.values(TRANSLATABLE_KEYS).flatMap((key) =>
    LOCALES.map((locale) => localizedKey(key, locale)),
  );
  return [...SHARED_KEYS, ...translatable];
}

async function readByKey(): Promise<Record<string, unknown>> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: allStoredKeys() } } });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getSiteSettings(locale: Locale = DEFAULT_LOCALE): Promise<SiteSettingsValues> {
  const byKey = await readByKey();

  const pick = (key: string): string | null =>
    readString(byKey[localizedKey(key, locale)]) ?? readString(byKey[key]);

  return {
    title: pick(TITLE_KEY) ?? DEFAULTS.title,
    description: pick(DESCRIPTION_KEY) ?? DEFAULTS.description,
    githubUrl: readString(byKey[GITHUB_KEY]),
    linkedinUrl: readString(byKey[LINKEDIN_KEY]),
    upworkUrl: readString(byKey[UPWORK_KEY]),
    fiverrUrl: readString(byKey[FIVERR_KEY]),
    instagramUrl: readString(byKey[INSTAGRAM_KEY]),
    resumeUrl: pick(RESUME_KEY),
    location: pick(LOCATION_KEY),
    contactAutoReplyEnabled: byKey[AUTO_REPLY_ENABLED_KEY] === "true",
    contactAutoReplySubject: pick(AUTO_REPLY_SUBJECT_KEY) ?? DEFAULTS.contactAutoReplySubject,
    contactAutoReplyBody: pick(AUTO_REPLY_BODY_KEY) ?? DEFAULTS.contactAutoReplyBody,
  };
}

export async function getLocalizedSiteSettings(): Promise<LocalizedSiteSettings> {
  const byKey = await readByKey();

  const translations = Object.fromEntries(
    LOCALES.map((locale) => {
      const values = Object.fromEntries(
        TRANSLATABLE_FIELDS.map((field) => {
          const stored = readString(byKey[localizedKey(TRANSLATABLE_KEYS[field], locale)]);
          const fallbackDefault =
            locale === DEFAULT_LOCALE
              ? (DEFAULTS[field as keyof SiteSettingsValues] as string | null)
              : null;
          return [field, stored ?? fallbackDefault ?? ""];
        }),
      ) as TranslatableSettings;
      return [locale, values];
    }),
  ) as Record<Locale, TranslatableSettings>;

  return {
    shared: {
      githubUrl: readString(byKey[GITHUB_KEY]),
      linkedinUrl: readString(byKey[LINKEDIN_KEY]),
      upworkUrl: readString(byKey[UPWORK_KEY]),
      fiverrUrl: readString(byKey[FIVERR_KEY]),
      instagramUrl: readString(byKey[INSTAGRAM_KEY]),
      contactAutoReplyEnabled: byKey[AUTO_REPLY_ENABLED_KEY] === "true",
    },
    translations,
  };
}

export async function saveLocalizedSiteSettings(input: LocalizedSiteSettings): Promise<void> {
  const upserts: [string, string][] = [
    [GITHUB_KEY, input.shared.githubUrl ?? ""],
    [LINKEDIN_KEY, input.shared.linkedinUrl ?? ""],
    [UPWORK_KEY, input.shared.upworkUrl ?? ""],
    [FIVERR_KEY, input.shared.fiverrUrl ?? ""],
    [INSTAGRAM_KEY, input.shared.instagramUrl ?? ""],
    [AUTO_REPLY_ENABLED_KEY, input.shared.contactAutoReplyEnabled ? "true" : "false"],
  ];
  const removals: string[] = [];

  for (const locale of LOCALES) {
    const values = input.translations[locale];
    if (!values) continue;
    for (const field of TRANSLATABLE_FIELDS) {
      const key = localizedKey(TRANSLATABLE_KEYS[field], locale);
      const value = values[field].trim();
      if (locale !== DEFAULT_LOCALE && value === "") removals.push(key);
      else upserts.push([key, value]);
    }
  }

  await prisma.$transaction([
    ...upserts.map(([key, value]) =>
      prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
    prisma.siteSetting.deleteMany({ where: { key: { in: removals } } }),
  ]);
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
    [AUTO_REPLY_ENABLED_KEY, values.contactAutoReplyEnabled ? "true" : "false"],
    [AUTO_REPLY_SUBJECT_KEY, values.contactAutoReplySubject],
    [AUTO_REPLY_BODY_KEY, values.contactAutoReplyBody],
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
