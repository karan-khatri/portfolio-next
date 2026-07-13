import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { skillFields } from "@/lib/admin/simple-content-fields";
import {
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
  reorderSkillAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminSkillsPage() {
  const items = await prisma.skill.findMany({ orderBy: { order: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Skills</h1>
      <SimpleContentList
        items={items}
        fields={skillFields}
        contentType="skill"
        onCreate={createSkillAction}
        onUpdate={updateSkillAction}
        onDelete={deleteSkillAction}
        onReorder={reorderSkillAction}
        emptyLabel="No skills listed yet."
      />
    </div>
  );
}
