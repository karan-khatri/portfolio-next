import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { JsonUploadForm } from "@/components/admin/json-upload-form";
import styles from "./page.module.scss";

export default async function AdminSeedPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Import / Seed</h1>
      <p className={styles.description}>
        Upload a JSON file to update site content directly — matching content (by slug, name, or key) is
        overwritten, and anything left out of the file is left untouched. Download the current content as a
        starting point below, edit it, then re-upload.
      </p>
      <a className={styles.templateLink} href="/api/admin/seed-template" download>
        Download current content as JSON
      </a>
      <JsonUploadForm />
    </div>
  );
}
