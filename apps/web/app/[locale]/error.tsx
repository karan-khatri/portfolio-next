"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LuArrowLeft, LuRefreshCw } from "react-icons/lu";
import { useI18n } from "@/lib/i18n/context";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, href } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="theme-site flex min-h-screen flex-col items-center justify-center bg-background px-6 py-32 text-foreground">
      <div className="flex w-full max-w-md flex-col items-start">
        <span className="font-mono text-xs text-primary">{`// ${t.eyebrow.serverError}`}</span>
        <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight">
          {t.errors.serverTitle}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t.errors.serverBody}</p>
        <div className="mt-8 flex items-center gap-6">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex items-center gap-2 font-mono text-xs text-primary"
          >
            <LuRefreshCw className="size-3.5 transition-transform group-hover:rotate-45" />
            {t.errors.tryAgain}
          </button>
          <Link href={href("/")} className="group inline-flex items-center gap-2 font-mono text-xs text-primary">
            <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            {t.common.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
