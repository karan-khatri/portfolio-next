"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LuCheck, LuCircleAlert, LuLoaderCircle, LuSparkles } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./ai-blog-generator.module.scss";

type Stage = "queued" | "researching" | "writing" | "saved" | "failed";

interface ProgressRow {
  id: string;
  title: string;
  stage: Stage;
  error: string | null;
  failedStage: string | null;
  postId: string | null;
  warnings: string[];
}

interface ItemDto {
  id: string;
  topic: string;
  status: string;
  failedStage: string | null;
  error: string | null;
  postId: string | null;
  warnings: string[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

const STEPS: { stage: Stage; label: string }[] = [
  { stage: "researching", label: "Researching" },
  { stage: "writing", label: "Writing" },
  { stage: "saved", label: "Saved" },
];

const MAX_POSTS = 5;

async function callApi<T>(url: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new Error("Network error. Check your connection and try again.");
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    envelope = null;
  }

  if (!response.ok || !envelope?.success || !envelope.data) {
    const fallback =
      response.status === 504 || response.status === 408
        ? "The request timed out on the server."
        : `Request failed (HTTP ${response.status}).`;
    throw new Error(envelope?.message || fallback);
  }
  return envelope.data;
}

function stageIndex(stage: Stage): number {
  if (stage === "queued") return -1;
  if (stage === "failed") return -1;
  return STEPS.findIndex((step) => step.stage === stage);
}

export function AiBlogGenerator({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [count, setCount] = useState("3");
  const [focus, setFocus] = useState("");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  function patchRow(id: string, patch: Partial<ProgressRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    if (runningRef.current) return;
    runningRef.current = true;

    setRunning(true);
    setRows([]);
    setRunError(null);
    setPhase("Discovering topics…");

    let runId: string | null = null;
    let saved = 0;

    try {
      const started = await callApi<{ runId: string }>("/api/admin/ai-blog/runs", {
        count: Number(count),
        focus,
      });
      runId = started.runId;

      const discovered = await callApi<{ items: ItemDto[] }>(
        `/api/admin/ai-blog/runs/${runId}/discover`,
      );
      setRows(
        discovered.items.map((item) => ({
          id: item.id,
          title: item.topic,
          stage: "queued",
          error: null,
          failedStage: null,
          postId: null,
          warnings: [],
        })),
      );
      setPhase(null);

      for (const item of discovered.items) {
        patchRow(item.id, { stage: "researching" });
        try {
          await callApi(`/api/admin/ai-blog/runs/${runId}/items/${item.id}/research`);
        } catch (error) {
          patchRow(item.id, {
            stage: "failed",
            failedStage: "Researching",
            error: error instanceof Error ? error.message : "Research failed",
          });
          continue;
        }

        patchRow(item.id, { stage: "writing" });
        try {
          const written = await callApi<{ item: ItemDto }>(
            `/api/admin/ai-blog/runs/${runId}/items/${item.id}/write`,
          );
          saved++;
          patchRow(item.id, {
            stage: "saved",
            postId: written.item.postId,
            warnings: written.item.warnings,
          });
        } catch (error) {
          patchRow(item.id, {
            stage: "failed",
            failedStage: "Writing",
            error: error instanceof Error ? error.message : "Writing failed",
          });
        }
      }
    } catch (error) {
      setPhase(null);
      setRunError(error instanceof Error ? error.message : "The run failed");
    } finally {
      if (runId) {
        try {
          await callApi(`/api/admin/ai-blog/runs/${runId}/finish`);
        } catch {
          setRunError((current) => current ?? "Could not close the run cleanly. It will expire on its own.");
        }
      }
      if (saved > 0) toast.success(`${saved} draft${saved === 1 ? "" : "s"} saved for review`);
      runningRef.current = false;
      setRunning(false);
      setPhase(null);
      router.refresh();
    }
  }

  return (
    <div className={styles.panel}>
      {!configured ? (
        <p className={styles.notice} role="alert">
          <LuCircleAlert aria-hidden="true" />
          EXPLABS_API_KEY is not set on the server, so generation is disabled. Add it to the environment and
          restart.
        </p>
      ) : null}

      <form onSubmit={handleGenerate} className={styles.form}>
        <div className={styles.field}>
          <Label htmlFor="ai-blog-count">Number of posts</Label>
          <Input
            id="ai-blog-count"
            type="number"
            min={1}
            max={MAX_POSTS}
            required
            value={count}
            onChange={(event) => setCount(event.target.value)}
            className={styles.countInput}
            disabled={running}
          />
        </div>
        <div className={styles.fieldGrow}>
          <Label htmlFor="ai-blog-focus">Focus keyword (optional)</Label>
          <Input
            id="ai-blog-focus"
            type="text"
            maxLength={80}
            placeholder="e.g. AI, backend"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            disabled={running}
          />
        </div>
        <Button type="submit" disabled={running || !configured}>
          {running ? <LuLoaderCircle className={styles.spinner} /> : <LuSparkles />}
          {running ? "Generating…" : "Generate"}
        </Button>
      </form>

      <p className={styles.hint}>
        Posts are always saved as drafts. Keep this tab open until the run finishes (about a minute per post).
      </p>

      {phase ? (
        <p className={styles.phase} role="status">
          <LuLoaderCircle className={styles.spinner} aria-hidden="true" />
          {phase}
        </p>
      ) : null}

      {runError ? (
        <p className={styles.error} role="alert">
          <LuCircleAlert aria-hidden="true" />
          {runError}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ul className={styles.rows} aria-live="polite">
          {rows.map((row) => {
            const active = stageIndex(row.stage);
            return (
              <li key={row.id} className={styles.row} data-stage={row.stage}>
                <div className={styles.rowHead}>
                  <span className={styles.rowTitle}>{row.title}</span>
                  {row.stage === "saved" && row.postId ? (
                    <Link href={`/admin/posts/${row.postId}`} className={styles.reviewLink}>
                      Review draft
                    </Link>
                  ) : null}
                </div>

                {row.stage === "failed" ? (
                  <p className={styles.rowError}>
                    <LuCircleAlert aria-hidden="true" />
                    <span>
                      Failed while {row.failedStage?.toLowerCase() ?? "processing"}: {row.error}
                    </span>
                  </p>
                ) : (
                  <ol className={styles.steps}>
                    <li className={styles.step} data-state="done">
                      <LuCheck aria-hidden="true" />
                      Discovered
                    </li>
                    {STEPS.map((step, index) => {
                      const state = index < active || row.stage === "saved" ? "done" : index === active ? "active" : "idle";
                      return (
                        <li key={step.stage} className={styles.step} data-state={state}>
                          {state === "done" ? (
                            <LuCheck aria-hidden="true" />
                          ) : state === "active" ? (
                            <LuLoaderCircle className={styles.spinner} aria-hidden="true" />
                          ) : (
                            <span className={styles.stepDot} aria-hidden="true" />
                          )}
                          {step.label}
                        </li>
                      );
                    })}
                  </ol>
                )}

                {row.warnings.length > 0 ? (
                  <ul className={styles.warnings}>
                    {row.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
