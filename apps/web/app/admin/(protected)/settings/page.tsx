import { getSiteSettings } from "@portfolio/db/server";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import styles from "./page.module.scss";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Settings</h1>
      <SiteSettingsForm initial={settings} />
    </div>
  );
}
