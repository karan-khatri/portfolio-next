"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LuArrowLeft, LuRefreshCw } from "react-icons/lu";

export default function Error({
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
    <div className="theme-site flex min-h-screen flex-col items-center justify-center bg-background px-6 py-32 text-foreground">
      <div className="flex w-full max-w-md flex-col items-start">
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes -- deliberate "styled like a comment" display text, not a real comment */}
        <span className="font-mono text-xs text-primary">// 500</span>
        <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          An unexpected error occurred while loading this page.
        </p>
        <div className="mt-8 flex items-center gap-6">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
          >
            <LuRefreshCw className="size-3.5 transition-transform group-hover:rotate-45" />
            Try again
          </button>
          <Link href="/" className="group inline-flex items-center gap-2 font-mono text-xs text-primary">
            <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
