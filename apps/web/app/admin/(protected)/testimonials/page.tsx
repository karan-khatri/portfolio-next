import { prisma } from "@portfolio/db/server";
import { SimpleContentList } from "@/components/admin/simple-content-list";
import { testimonialFields } from "@/lib/admin/simple-content-fields";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialAction,
} from "./actions";
import styles from "./page.module.scss";

export default async function AdminTestimonialsPage() {
  const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Testimonials</h1>
      <SimpleContentList
        items={items}
        fields={testimonialFields}
        contentType="testimonial"
        onCreate={createTestimonialAction}
        onUpdate={updateTestimonialAction}
        onDelete={deleteTestimonialAction}
        onReorder={reorderTestimonialAction}
        emptyLabel="No testimonials yet."
      />
    </div>
  );
}
