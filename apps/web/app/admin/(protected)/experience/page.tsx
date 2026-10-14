import { LocalizedListSection } from "@/components/admin/localized-list-section";
import styles from "./page.module.scss";

export default function AdminExperiencePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Experience</h1>
      <LocalizedListSection listKey="experience" emptyLabel="No experience listed yet." />
    </div>
  );
}
