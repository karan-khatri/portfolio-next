import { LocalizedListSection } from "@/components/admin/localized-list-section";
import styles from "./page.module.scss";

export default function AdminEducationPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Education</h1>
      <LocalizedListSection listKey="education" emptyLabel="No education listed yet." />
    </div>
  );
}
