"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LuArrowLeft, LuRefreshCw, LuTriangleAlert } from "react-icons/lu";

// Scoped to admin/(protected) specifically: this segment's layout.tsx already
// wraps {children} in AdminShell, and a segment error.tsx only replaces the
// layout's children, not the layout itself — so the sidebar/nav chrome stays
// on screen instead of the whole admin shell blanking out to the root
// app/error.tsx boundary.
export default function AdminError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <LuTriangleAlert className="size-8 text-destructive" />
      <h1 className="font-heading text-2xl font-semibold">Something went wrong loading this page</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="mt-2 flex items-center gap-6">
        <button
          type="button"
          onClick={reset}
          className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
        >
          <LuRefreshCw className="size-3.5 transition-transform group-hover:rotate-45" />
          Try again
        </button>
        <Link href="/admin" className="group inline-flex items-center gap-2 font-mono text-xs text-primary">
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
