import { LocalizedListSection } from "@/components/admin/localized-list-section";
import styles from "./page.module.scss";

export default function AdminServicesPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Services</h1>
      <LocalizedListSection listKey="service" emptyLabel="No services listed yet." />
    </div>
  );
}
