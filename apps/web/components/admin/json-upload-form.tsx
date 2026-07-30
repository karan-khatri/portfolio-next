"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { LuFileJson } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { seedPayloadSchema } from "@/lib/admin/seed-schema";
import { JsonPreview, type JsonPreviewResult } from "./json-preview";
import { ConfirmSeedDialog } from "./confirm-seed-dialog";
import type { SeedUploadResult } from "@/app/admin/(protected)/seed/actions";
import styles from "./json-upload-form.module.scss";

export function JsonUploadForm() {
  const fileInputId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<JsonPreviewResult>({ status: "empty" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [summary, setSummary] = useState<SeedUploadResult["summary"] | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? null);
    setSummary(null);
    if (!file) {
      setResult({ status: "empty" });
      return;
    }

    const text = await file.text();
    setRawText(text);

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      setResult({ status: "invalid-json" });
      return;
    }

    const parsed = seedPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      setResult({
        status: "invalid-schema",
        issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      });
      return;
    }

    setResult({ status: "valid", data: parsed.data });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (result.status !== "valid") return;
    setPendingFormData(new FormData(event.currentTarget));
    setConfirmOpen(true);
  }

  function handleApplied(nextSummary: SeedUploadResult["summary"]) {
    setSummary(nextSummary ?? null);
    formRef.current?.reset();
    setFileName(null);
    setResult({ status: "empty" });
    setRawText("");
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <Label htmlFor={fileInputId}>JSON file</Label>
          <label htmlFor={fileInputId} className={styles.fileTrigger}>
            <span className={styles.fileIconWrap}>
              <LuFileJson className={styles.fileIcon} />
            </span>
            <span className={styles.fileTitle}>{fileName ?? "Upload a seed JSON file"}</span>
            <span className={styles.fileHint}>
              {fileName ? "Selected — review the preview below" : "Click to browse — .json, up to 2MB"}
            </span>
          </label>
          <input
            id={fileInputId}
            name="file"
            type="file"
            accept=".json,application/json"
            required
            className={styles.fileInput}
            onChange={handleFileChange}
          />
        </div>

        <JsonPreview result={result} rawText={rawText} />

        <Button type="submit" disabled={result.status !== "valid"}>
          Continue
        </Button>
      </form>

      {pendingFormData ? (
        <ConfirmSeedDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          formData={pendingFormData}
          onApplied={handleApplied}
        />
      ) : null}

      {summary ? (
        <div className={styles.result}>
          <p className={styles.resultTitle}>Applied:</p>
          <pre className={styles.resultJson}>{JSON.stringify(summary, null, 2)}</pre>
        </div>
      ) : null}
    </>
  );
}
