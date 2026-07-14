import { listMedia } from "@portfolio/db/server";
import { MediaLibrary } from "@/components/admin/media-library";
import { Pagination } from "@/components/admin/pagination";
import { toMediaPickerValue } from "@/lib/admin/media";
import styles from "./page.module.scss";

const PAGE_SIZE = 24;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const { items, total } = await listMedia({
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Media</h1>
      <MediaLibrary initialMedia={items.map(toMediaPickerValue)} />
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/media" />
    </div>
  );
}
