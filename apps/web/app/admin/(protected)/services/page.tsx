import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { serviceFields } from "@/lib/admin/simple-content-fields";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  reorderServiceAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminServicesPage() {
  const items = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Services</h1>
      <SimpleContentList
        items={items}
        fields={serviceFields}
        contentType="service"
        onCreate={createServiceAction}
        onUpdate={updateServiceAction}
        onDelete={deleteServiceAction}
        onReorder={reorderServiceAction}
        emptyLabel="No services listed yet."
      />
    </div>
  );
}
