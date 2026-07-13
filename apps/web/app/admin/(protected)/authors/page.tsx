import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { authorFields } from "@/lib/admin/simple-content-fields";
import { createAuthorAction, updateAuthorAction, deleteAuthorAction } from "./actions";
import styles from "./page.module.scss";

export default async function AdminAuthorsPage() {
  const items = await prisma.author.findMany({ orderBy: { name: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Authors</h1>
      <SimpleContentList
        items={items}
        fields={authorFields}
        contentType="author"
        reorderable={false}
        onCreate={createAuthorAction}
        onUpdate={updateAuthorAction}
        onDelete={deleteAuthorAction}
        emptyLabel="No authors yet."
      />
    </div>
  );
}
