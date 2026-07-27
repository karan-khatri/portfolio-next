import { LuBrain } from "react-icons/lu";
import { cn } from "@/lib/utils";
import type { SkillsDiagramItem } from "@portfolio/sections";

function ClusterPills({
  items,
  accent,
  align,
}: {
  items: SkillsDiagramItem[];
  accent: "primary" | "secondary";
  align: "left" | "right";
}) {
  const textClass = accent === "secondary" ? "md:text-secondary" : "md:text-primary";
  const bgClass = accent === "secondary" ? "md:bg-secondary" : "md:bg-primary";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2.5 justify-start",
        align === "right" ? "md:justify-end" : "md:justify-center",
      )}
    >
      {items.map((item, index) => (
        <span
          key={item.id}
          className={cn(
            "relative rounded-full border px-4 py-2 font-mono text-sm whitespace-nowrap",
            index === 0
              ? cn("md:border-current/50 md:bg-card/60 font-semibold", textClass)
              : "md:border-border/60 md:bg-card/30 md:text-muted-foreground",
          )}
        >
          {item.label}
          {index === 0 ? (
            <span className="absolute hidden md:inline-flex -top-2 -right-2 size-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full motion-safe:animate-ping",
                  bgClass,
                )}
              />
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

function ClusterBlock({
  title,
  items,
  accent,
  align,
  floatDirection,
}: Readonly<{
  title?: string;
  items: SkillsDiagramItem[];
  accent: "primary" | "secondary";
  align: "left" | "right";
  floatDirection: "down-up" | "up-down";
}>) {
  if (items.length === 0) return null;
  const accentTextClass = accent === "secondary" ? "text-secondary" : "text-primary";

  return (
    <div
      className={cn(
        "flex max-w-64 w-full flex-col gap-2.5 motion-safe:animate-[var(--float-anim)_6s_ease-in-out_infinite] text-left md:text-center",
      )}
      style={{ "--float-anim": `float-${floatDirection}` } as React.CSSProperties}
    >
      <ClusterPills items={items} accent={accent} align={align} />
      {title ? (
        <span className={cn("font-mono text-[10px] tracking-[0.28em] uppercase ", accentTextClass)}>
          {title}
        </span>
      ) : null}
    </div>
  );
}

function CenterOrb({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="relative flex size-60 shrink-0 items-center justify-center mx-auto">

      <div className="glass-panel flex size-60 flex-col items-center justify-center gap-2 rounded-full text-center shadow-xl">
        <LuBrain className="size-14 text-foreground" />
        <span className="font-heading text-sm font-bold tracking-wide uppercase">{label}</span>
        {subtitle ? (
          <span className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            {subtitle}
          </span>
        ) : null}
        <div
          className="absolute w-full motion-safe:animate-spin"
          style={{ animationDuration: "7s", animationTimingFunction: "linear" }}
        >
          <span className="absolute -left-1.5 size-3 rounded-full opacity-75 bg-primary shadow-[0_0_10px_2px_var(--primary)]" />
        </div>
      </div>

    </div>
  );
}

export interface SkillsDiagramProps {
  centerLabel?: string;
  centerSubtitle?: string;
  topLeftTitle?: string;
  topLeftItems: SkillsDiagramItem[];
  bottomLeftTitle?: string;
  bottomLeftItems: SkillsDiagramItem[];
  topRightTitle?: string;
  topRightItems: SkillsDiagramItem[];
  bottomRightTitle?: string;
  bottomRightItems: SkillsDiagramItem[];
}

export function SkillsDiagram({
  centerLabel,
  centerSubtitle,
  topLeftTitle,
  topLeftItems,
  bottomLeftTitle,
  bottomLeftItems,
  topRightTitle,
  topRightItems,
  bottomRightTitle,
  bottomRightItems,
}: Readonly<SkillsDiagramProps>) {
  const hasAnyCluster =
    topLeftItems.length > 0 ||
    bottomLeftItems.length > 0 ||
    topRightItems.length > 0 ||
    bottomRightItems.length > 0;

  if (!hasAnyCluster) return null;

  const stackedClusters = [
    { title: topLeftTitle, items: topLeftItems },
    { title: topRightTitle, items: topRightItems },
    { title: bottomLeftTitle, items: bottomLeftItems },
    { title: bottomRightTitle, items: bottomRightItems },
  ].filter((cluster) => cluster.items.length > 0);

  return (
    <div className="mt-16 flex flex-col items-center">
      {/* Compact stacked layout below the orbit breakpoint */}
      <div className="flex flex-col items-center gap-8 md:hidden">
        <CenterOrb label={centerLabel ?? "Tech Stack"} subtitle={centerSubtitle} />
        <div className="flex w-full flex-col gap-6">
          {stackedClusters.map((cluster) => (
            <div key={cluster.title ?? cluster.items[0]?.id} className="flex flex-col gap-2.5">
              {cluster.title ? (
                <span className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">
                  {cluster.title}
                </span>
              ) : null}
              <ClusterPills items={cluster.items} accent="primary" align="left" />
            </div>
          ))}
        </div>
      </div>

      {/* Orbit layout */}
      <div className="relative justify-center items-center w-full min-h-80 hidden md:flex">
        <div className="relative mx-auto">
          <CenterOrb label={centerLabel ?? "Tech Stack"} subtitle={centerSubtitle} />
        </div>
        <div className="absolute inline-block top-0 left-0 lg:left-1/7 xl:left-1/6">
          <ClusterBlock
            title={topLeftTitle}
            items={topLeftItems}
            accent="primary"
            align="left"
            floatDirection="down-up"
          />
        </div>
        <div className="absolute inline-block bottom-0 left-0 lg:left-1/7 xl:left-1/6">
          <ClusterBlock
            title={bottomLeftTitle}
            items={bottomLeftItems}
            accent="primary"
            align="left"
            floatDirection="up-down"
          />
        </div>
        <div className="absolute inline-block top-0 right-0 lg:right-1/7 xl:right-1/6">
          <ClusterBlock
            title={topRightTitle}
            items={topRightItems}
            accent="secondary"
            align="right"
            floatDirection="up-down"
          />
        </div>
        <div className="absolute inline-block right-0 lg:right-1/7 xl:right-1/6 bottom-0">
          <ClusterBlock
            title={bottomRightTitle}
            items={bottomRightItems}
            accent="secondary"
            align="right"
            floatDirection="down-up"
          />
        </div>
        
      </div>
    </div>
  );
}
