import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { redirectFields } from "@/lib/admin/simple-content-fields";
import {
  createRedirectAction,
  updateRedirectAction,
  deleteRedirectAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminRedirectsPage() {
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
  const items = redirects.map((redirect) => ({
    ...redirect,
    permanent: redirect.statusCode === 308,
  }));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Redirects</h1>
      <SimpleContentList
        items={items}
        fields={redirectFields}
        contentType="redirect"
        reorderable={false}
        onCreate={createRedirectAction}
        onUpdate={updateRedirectAction}
        onDelete={deleteRedirectAction}
        emptyLabel="No redirects yet."
      />
    </div>
  );
}
