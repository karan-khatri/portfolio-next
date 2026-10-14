import type { Metadata } from "next";
import { getSiteSettings } from "@portfolio/db/server";
import { LOCALE_META, type AppLocale } from "@/lib/i18n/config";
import { absoluteUrl, localizePath } from "@/lib/i18n/paths";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function buildRootMetadata(locale: AppLocale): Promise<Metadata> {
  const settings = await getSiteSettings(locale);
  const homeUrl = absoluteUrl(siteUrl, localizePath("/", locale));

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.title,
      template: `%s | ${settings.title}`,
    },
    description: settings.description,
    authors: [{ name: settings.title }],
    openGraph: {
      type: "website",
      url: homeUrl,
      siteName: settings.title,
      title: settings.title,
      description: settings.description,
      locale: LOCALE_META[locale].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.title,
      description: settings.description,
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
  };
}
