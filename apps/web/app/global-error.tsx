"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* This boundary replaces the entire root layout (including <html>/<body>),
            so ThemeProvider and globals.css are unavailable here — light/dark is
            handled with a plain prefers-color-scheme media query instead. */}
        <style>{`
          :root {
            --ge-background: oklch(0.98 0.005 240);
            --ge-foreground: oklch(0.22 0.02 240);
            --ge-muted-foreground: oklch(0.45 0.02 235);
            --ge-primary: oklch(0.5 0.14 175);
            --ge-border: oklch(0 0 0 / 8%);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --ge-background: oklch(0.16 0.02 240);
              --ge-foreground: oklch(0.93 0.015 230);
              --ge-muted-foreground: oklch(0.68 0.03 235);
              --ge-primary: oklch(0.87 0.15 175);
              --ge-border: oklch(1 0 0 / 10%);
            }
          }
        `}</style>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            color: "var(--ge-foreground)",
            background: "var(--ge-background)",
          }}
        >
          <div style={{ maxWidth: "28rem", padding: "1.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
            <p style={{ marginTop: "1rem", color: "var(--ge-muted-foreground)" }}>
              The application hit an unexpected error. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "2rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--ge-border)",
                background: "transparent",
                color: "var(--ge-primary)",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
