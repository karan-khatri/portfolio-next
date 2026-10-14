import type { AppLocale } from "@/lib/i18n/config";

/**
 * Plain view-model shapes for admin client components. Declared here (rather
 * than importing from @portfolio/db) so client components depend on the web
 * app's own contracts, not the data layer's types — server actions still
 * return the db package's structurally-identical types, which satisfy these.
 */

export type EntityType = "Page" | "Project" | "Post";

export interface MediaUsageCounts {
  seo: number;
  projectCovers: number;
  postCovers: number;
}

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

export interface TranslatableSettingsValues {
  title: string;
  description: string;
  resumeUrl: string;
  location: string;
  contactAutoReplySubject: string;
  contactAutoReplyBody: string;
}

export interface LocalizedSiteSettingsValues {
  shared: {
    githubUrl: string | null;
    linkedinUrl: string | null;
    upworkUrl: string | null;
    fiverrUrl: string | null;
    instagramUrl: string | null;
    contactAutoReplyEnabled: boolean;
  };
  translations: Record<AppLocale, TranslatableSettingsValues>;
}
