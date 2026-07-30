"use client";

import { useState } from "react";
import { LuTriangleAlert, LuChevronDown, LuChevronRight } from "react-icons/lu";
import type { z } from "zod";
import type { seedPayloadSchema } from "@/lib/admin/seed-schema";
import styles from "./json-preview.module.scss";

export type JsonPreviewResult =
  | { status: "empty" }
  | { status: "invalid-json" }
  | { status: "invalid-schema"; issues: string[] }
  | { status: "valid"; data: z.infer<typeof seedPayloadSchema> };

type SeedPayload = z.infer<typeof seedPayloadSchema>;

function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const SECTION_LABELS: { [K in keyof SeedPayload]?: (value: NonNullable<SeedPayload[K]>) => string } = {
  media: (value) => `Media: ${countLabel(value.length, "item")}`,
  techStack: (value) => `Tech stack: ${countLabel(value.length, "item")}`,
  siteSettings: () => "Site settings: will be updated",
  projects: (value) => `Projects: ${countLabel(value.length, "item")}`,
  homePageSections: (value) => `Home page sections: ${countLabel(value.length, "section")}`,
  resumeExperience: (value) => `Resume experience: ${countLabel(value.length, "entry", "entries")} (replaces all)`,
  resumeEducation: (value) => `Resume education: ${countLabel(value.length, "entry", "entries")} (replaces all)`,
  resumeLanguages: (value) => `Languages: ${countLabel(value.length, "entry", "entries")} (replaces all)`,
  resumeSkills: (value) => `Skills: ${countLabel(value.length, "entry", "entries")} (replaces all)`,
};

export function JsonPreview({ result, rawText }: { result: JsonPreviewResult; rawText: string }) {
  const [showRaw, setShowRaw] = useState(false);

  if (result.status === "empty") return null;

  if (result.status === "invalid-json") {
    return (
      <div className={styles.callout} data-variant="error">
        <LuTriangleAlert className={styles.calloutIcon} />
        <span>This file isn&rsquo;t valid JSON.</span>
      </div>
    );
  }

  if (result.status === "invalid-schema") {
    return (
      <div className={styles.callout} data-variant="error">
        <LuTriangleAlert className={styles.calloutIcon} />
        <div>
          <p className={styles.calloutTitle}>This JSON doesn&rsquo;t match the expected shape:</p>
          <ul className={styles.issueList}>
            {result.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const populatedKeys = (Object.keys(result.data) as Array<keyof SeedPayload>).filter(
    (key) => result.data[key] !== undefined,
  );

  return (
    <div className={styles.preview}>
      {populatedKeys.length === 0 ? (
        <p className={styles.empty}>This file has no recognized sections — nothing would change.</p>
      ) : (
        <ul className={styles.summaryList}>
          {populatedKeys.map((key) => {
            const value = result.data[key];
            const label = value !== undefined ? SECTION_LABELS[key]?.(value as never) : undefined;
            return <li key={key}>{label ?? key}</li>;
          })}
        </ul>
      )}
      <button type="button" className={styles.rawToggle} onClick={() => setShowRaw((prev) => !prev)}>
        {showRaw ? <LuChevronDown /> : <LuChevronRight />}
        {showRaw ? "Hide raw JSON" : "Show raw JSON"}
      </button>
      {showRaw ? <pre className={styles.rawJson}>{rawText}</pre> : null}
    </div>
  );
}
