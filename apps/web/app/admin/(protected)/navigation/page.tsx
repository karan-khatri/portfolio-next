import { prisma } from "@portfolio/db/server";
import { NavigationManager } from "@/components/admin/navigation-manager";
import styles from "./page.module.scss";

export default async function AdminNavigationPage() {
  const items = await prisma.navigationItem.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Navigation</h1>
      <p className={styles.hint}>
        Add links here to override the public site&rsquo;s auto-generated section nav. With no
        links, the header falls back to linking each visible section on the home page. Sub-links
        render as a dropdown under their parent.
      </p>
      <NavigationManager items={items} />
    </div>
  );
}
