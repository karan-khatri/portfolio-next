import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { experienceFields } from "@/lib/admin/simple-content-fields";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
  reorderExperienceAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminExperiencePage() {
  const items = await prisma.experience.findMany({ orderBy: { order: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Experience</h1>
      <SimpleContentList
        items={items}
        fields={experienceFields}
        contentType="experience"
        onCreate={createExperienceAction}
        onUpdate={updateExperienceAction}
        onDelete={deleteExperienceAction}
        onReorder={reorderExperienceAction}
        emptyLabel="No experience listed yet."
      />
    </div>
  );
}
