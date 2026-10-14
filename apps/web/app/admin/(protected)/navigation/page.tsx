import { prisma } from "@portfolio/db/server";
import { NavigationManager } from "@/components/admin/navigation-manager";
import { LocaleLinkTabs } from "@/components/admin/locale-link-tabs";
import { resolveAppLocale } from "@/lib/i18n/config";
import styles from "./page.module.scss";

export default async function AdminNavigationPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveAppLocale(lang);

  const items = await prisma.navigationItem.findMany({
    where: { parentId: null, locale },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Navigation</h1>
      <LocaleLinkTabs basePath="/admin/navigation" current={locale} />
      <p className={styles.hint}>
        Add links here to override the public site&rsquo;s auto-generated section nav. With no
        links, the header falls back to linking each visible section on the home page. Sub-links
        render as a dropdown under their parent. Use paths like <code>/blog</code> or{" "}
        <code>#about</code> in every language &mdash; the language prefix is added automatically.
      </p>
      <NavigationManager items={items} locale={locale} />
    </div>
  );
}
