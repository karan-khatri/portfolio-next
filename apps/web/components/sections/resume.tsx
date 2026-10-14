import type { ResumeContent } from "@portfolio/sections";
import { LuDownload, LuFileText } from "react-icons/lu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SectionShell } from "./section-shell";

export function ResumeSection({
  locale,
  id,
  content,
  headingLevel,
}: {
  locale: AppLocale;
  id: string;
  content: ResumeContent;
  headingLevel: 1 | 2 | 3;
}) {
  const t = getDictionary(locale);

  return (
    <SectionShell
      eyebrow={t.eyebrow.resume}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
        <div className="glass-panel glow-primary flex max-w-xl flex-col items-start gap-4 rounded-xl p-6 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LuFileText className="size-5" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.resume.blurb}
            </p>
          </div>
          <a
            href={content.fileUrl}
            className={cn(
              buttonVariants({ size: "lg" }),
              "shrink-0 font-mono text-xs tracking-wide uppercase",
            )}
          >
            <LuDownload />
            {content.ctaLabel ?? t.resume.download}
          </a>
        </div>
    </SectionShell>
  );
}
