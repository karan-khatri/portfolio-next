import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { languageFields } from "@/lib/admin/simple-content-fields";
import {
  createLanguageAction,
  updateLanguageAction,
  deleteLanguageAction,
  reorderLanguageAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminLanguagesPage() {
  const items = await prisma.language.findMany({ orderBy: { order: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Languages</h1>
      <SimpleContentList
        items={items}
        fields={languageFields}
        contentType="language"
        onCreate={createLanguageAction}
        onUpdate={updateLanguageAction}
        onDelete={deleteLanguageAction}
        onReorder={reorderLanguageAction}
        emptyLabel="No languages listed yet."
      />
    </div>
  );
}
