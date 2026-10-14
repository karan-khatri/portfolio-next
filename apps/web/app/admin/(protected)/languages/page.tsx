import { LocalizedListSection } from "@/components/admin/localized-list-section";
import styles from "./page.module.scss";

export default function AdminLanguagesPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Languages</h1>
      <LocalizedListSection listKey="language" emptyLabel="No languages listed yet." />
    </div>
  );
}
