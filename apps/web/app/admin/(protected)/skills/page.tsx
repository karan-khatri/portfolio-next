import { LocalizedListSection } from "@/components/admin/localized-list-section";
import styles from "./page.module.scss";

export default function AdminSkillsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Skills</h1>
      <LocalizedListSection listKey="skill" emptyLabel="No skills listed yet." />
    </div>
  );
}
