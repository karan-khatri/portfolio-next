import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RootDocument } from "@/components/root-document";
import { I18nProvider } from "@/lib/i18n/context";
import { LOCALES, LOCALE_META, isAppLocale } from "@/lib/i18n/config";
import { buildRootMetadata } from "@/lib/root-metadata";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  return buildRootMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  return (
    <RootDocument lang={LOCALE_META[locale].htmlLang}>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </RootDocument>
  );
}
