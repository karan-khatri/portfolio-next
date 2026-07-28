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
}
