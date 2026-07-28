"use client";

import dynamic from "next/dynamic";
import styles from "./rich-text-editor.module.scss";

export const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className={`${styles.wrapper} animate-pulse`} style={{ minHeight: "16rem" }} />,
  },
);
