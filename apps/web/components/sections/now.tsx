import type { NowContent } from "@portfolio/sections";
import { LuCircleCheck, LuCircleDot, LuCircle } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { SectionShell } from "./section-shell";

const STATUS_ICON = {
  done: LuCircleCheck,
  in_progress: LuCircleDot,
  remaining: LuCircle,
} as const;

const STATUS_ICON_CLASS = {
  done: "text-primary",
  in_progress: "text-amber-500",
  remaining: "text-muted-foreground/40",
} as const;

const STATUS_LABEL_CLASS = {
  done: "text-foreground",
  in_progress: "text-foreground",
  remaining: "text-muted-foreground/60",
} as const;

export function NowSection({
  id,
  content,
  headingLevel,
}: Readonly<{
  id: string;
  content: NowContent;
  headingLevel: 1 | 2 | 3;
}>) {
  return (
    <SectionShell
      eyebrow="Now"
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/25 via-primary/10 to-secondary/25 p-6 sm:p-8">
        {content.description ? (
          <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
            {content.description}
          </p>
        ) : null}
        {content.items.length > 0 ? (
          <div className={cn("flex flex-wrap gap-x-8 gap-y-4", content.description && "mt-8")}>
            {content.items.map((item) => {
              const Icon = STATUS_ICON[item.status];
              return (
                <div key={item.id} className="flex items-center gap-2">
                  <Icon className={cn("size-4 shrink-0", STATUS_ICON_CLASS[item.status])} />
                  <span
                    className={cn(
                      "font-mono text-sm font-medium",
                      STATUS_LABEL_CLASS[item.status],
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
