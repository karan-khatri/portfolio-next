import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { navigationItemFields } from "@/lib/admin/simple-content-fields";
import {
  createNavigationItemAction,
  updateNavigationItemAction,
  deleteNavigationItemAction,
  reorderNavigationItemAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminNavigationPage() {
  const items = await prisma.navigationItem.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Navigation</h1>
      <p className={styles.hint}>
        Add links here to override the public site&rsquo;s auto-generated section nav. With no
        links, the header falls back to linking each visible section on the home page.
      </p>
      <SimpleContentList
        items={items}
        fields={navigationItemFields}
        contentType="navigationItem"
        onCreate={createNavigationItemAction}
        onUpdate={updateNavigationItemAction}
        onDelete={deleteNavigationItemAction}
        onReorder={reorderNavigationItemAction}
        emptyLabel="No nav links yet — using auto-generated section links."
      />
    </div>
  );
}
