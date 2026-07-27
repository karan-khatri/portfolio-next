import Link from "next/link";
import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { techStackFields } from "@/lib/admin/simple-content-fields";
import {
  createTechStackItemAction,
  updateTechStackItemAction,
  deleteTechStackItemAction,
  reorderTechStackItemAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminTechStackPage() {
  const items = await prisma.techStackItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Tech Stack</h1>
      <p className={styles.description}>
        Shown in the marquee on the homepage Skills section. Upload a logo in{" "}
        <Link href="/admin/media">Media</Link>, then paste its URL here — items without an image
        fall back to a generic icon.
      </p>
      <SimpleContentList
        items={items}
        fields={techStackFields}
        contentType="techStack"
        onCreate={createTechStackItemAction}
        onUpdate={updateTechStackItemAction}
        onDelete={deleteTechStackItemAction}
        onReorder={reorderTechStackItemAction}
        emptyLabel="No tech stack items yet."
      />
    </div>
  );
}
