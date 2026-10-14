import type { Metadata } from "next";
import { RootDocument } from "@/components/root-document";
import { buildRootMetadata } from "@/lib/root-metadata";
import styles from "./layout.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await buildRootMetadata("en")),
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootDocument lang="en">
      <div className={styles.root}>{children}</div>
    </RootDocument>
  );
}
