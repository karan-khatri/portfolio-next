import Link from "next/link";
import { prisma } from "@portfolio/db/server";
import { AiBlogGenerator } from "@/components/admin/ai-blog-generator";
import { Card, CardContent } from "@/components/ui/card";
import { isLlmConfigured } from "@/lib/ai-blog/config";
import { totalUsage } from "@/lib/ai-blog/pipeline";
import { formatRelativeTime } from "@/lib/admin/format-relative-time";
import styles from "./page.module.scss";

const HISTORY_LIMIT = 15;

export default async function AdminAiBlogPage() {
  const runs = await prisma.aiBlogRun.findMany({
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
    include: {
      createdBy: { select: { email: true } },
      items: { orderBy: { position: "asc" } },
    },
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>AI Blog Generator</h1>

      <Card>
        <CardContent>
          <AiBlogGenerator configured={isLlmConfigured()} />
        </CardContent>
      </Card>

      <section className={styles.history} aria-labelledby="ai-blog-history">
        <h2 id="ai-blog-history" className={styles.subheading}>
          Run history
        </h2>

        {runs.length === 0 ? (
          <p className={styles.empty}>No runs yet.</p>
        ) : (
          <ul className={styles.runs}>
            {runs.map((run) => {
              const usage = totalUsage(run.discoveryUsage, run.items);
              const saved = run.items.filter((item) => item.status === "SAVED").length;
              return (
                <li key={run.id}>
                  <Card size="sm">
                    <CardContent className={styles.run}>
                      <div className={styles.runHead}>
                        <span className={styles.runStatus} data-status={run.status.toLowerCase()}>
                          {run.status}
                        </span>
                        <time className={styles.meta} dateTime={run.createdAt.toISOString()} title={run.createdAt.toLocaleString()}>
                          {formatRelativeTime(run.createdAt)}
                        </time>
                        <span className={styles.meta}>
                          {saved}/{run.requestedCount} saved
                        </span>
                        {run.focusKeyword ? <span className={styles.meta}>focus: {run.focusKeyword}</span> : null}
                        <span className={styles.meta}>
                          {usage.totalTokens.toLocaleString()} tokens ({usage.promptTokens.toLocaleString()} in /{" "}
                          {usage.completionTokens.toLocaleString()} out)
                        </span>
                      </div>

                      {run.error ? <p className={styles.runError}>{run.error}</p> : null}

                      {run.items.length > 0 ? (
                        <ul className={styles.topics}>
                          {run.items.map((item) => (
                            <li key={item.id} className={styles.topic}>
                              <span className={styles.topicStatus} data-status={item.status.toLowerCase()}>
                                {item.status}
                              </span>
                              {item.postId ? (
                                <Link href={`/admin/posts/${item.postId}`} className={styles.topicLink}>
                                  {item.topic}
                                </Link>
                              ) : (
                                <span>{item.topic}</span>
                              )}
                              {item.error ? <span className={styles.topicError}>{item.error}</span> : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
