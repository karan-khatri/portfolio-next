import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { educationFields } from "@/lib/admin/simple-content-fields";
import {
  createEducationAction,
  updateEducationAction,
  deleteEducationAction,
  reorderEducationAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminEducationPage() {
  const items = await prisma.education.findMany({ orderBy: { order: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Education</h1>
      <SimpleContentList
        items={items}
        fields={educationFields}
        contentType="education"
        onCreate={createEducationAction}
        onUpdate={updateEducationAction}
        onDelete={deleteEducationAction}
        onReorder={reorderEducationAction}
        emptyLabel="No education listed yet."
      />
    </div>
  );
}
