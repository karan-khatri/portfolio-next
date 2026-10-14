import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { LocaleOnly } from "@/components/locale-only";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";
import { LOCALES, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/paths";

function NotFoundBody({ locale }: { locale: AppLocale }) {
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-6 py-32 sm:px-8 lg:px-12">
      <span className="font-mono text-xs text-primary">{`// ${t.eyebrow.notFound}`}</span>
      <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight">{t.errors.notFoundTitle}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t.errors.notFoundBody}</p>
      <Link
        href={localizePath("/", locale)}
        className="group mt-8 inline-flex items-center gap-2 font-mono text-xs text-primary"
      >
        <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
        {t.common.backHome}
      </Link>
    </div>
  );
}

export default async function NotFound() {
  const shells = await Promise.all(
    LOCALES.map(async (locale) => {
      const { navItems, settings } = await getPublicNav(locale);
      return (
        <LocaleOnly key={locale} locale={locale}>
          <PublicShell
            locale={locale}
            title={settings.title}
            navItems={navItems}
            resumeUrl={settings.resumeUrl}
            githubUrl={settings.githubUrl}
            linkedinUrl={settings.linkedinUrl}
          >
            <NotFoundBody locale={locale} />
          </PublicShell>
        </LocaleOnly>
      );
    }),
  );

  return <>{shells}</>;
}
