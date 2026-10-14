import { LocalizedListSection } from "@/components/admin/localized-list-section";
import styles from "./page.module.scss";

export default function AdminTestimonialsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Testimonials</h1>
      <LocalizedListSection listKey="testimonial" emptyLabel="No testimonials yet." />
    </div>
  );
}
