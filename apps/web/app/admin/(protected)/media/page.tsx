import { listMedia } from "@portfolio/db/server";
import { MediaLibrary } from "@/components/admin/media-library";
import { toMediaPickerValue } from "@/lib/admin/media";
import styles from "./page.module.scss";

export default async function AdminMediaPage() {
  const media = await listMedia();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Media</h1>
      <MediaLibrary initialMedia={media.map(toMediaPickerValue)} />
    </div>
  );
}
