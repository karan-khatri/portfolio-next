import type { ReactNode } from "react";
import Link from "next/link";
import { LuArrowLeft, LuCopy, LuExternalLink } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import styles from "./editor-shell.module.scss";

export function EditorShell({
  backHref,
  backLabel,
  heading,
  status,
  hasDraft,
  sidebar,
  translationBar,
  children,
}: {
  backHref: string;
  backLabel: string;
  heading: string;
  status: string;
  hasDraft: boolean;
  sidebar: ReactNode;
  translationBar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href={backHref} className={styles.backLink}>
          <LuArrowLeft className={styles.backIcon} />
          {backLabel}
        </Link>
        <div className={styles.titleRow}>
          <h1 className={styles.heading}>{heading}</h1>
          <StatusBadge status={status} />
          {hasDraft ? <StatusBadge status="UNPUBLISHED DRAFT LOADED" /> : null}
        </div>
      </div>

      {translationBar}

      <div className={styles.layout}>
        <div className={styles.mainColumn}>{children}</div>
        <div className={styles.sidebarColumn}>{sidebar}</div>
      </div>
    </div>
  );
}

export function PreviewLinkBox({ previewUrl, onCopy }: { previewUrl: string; onCopy: () => void }) {
  return (
    <div className={styles.previewBox}>
      <a href={previewUrl} target="_blank" rel="noreferrer" className={styles.previewLink}>
        {previewUrl}
        <LuExternalLink className={styles.previewIcon} />
      </a>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onCopy}>
        <LuCopy />
      </Button>
    </div>
  );
}
