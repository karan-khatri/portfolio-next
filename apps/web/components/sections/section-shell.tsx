import { cn } from "@/lib/utils";
import { SectionHeading } from "./heading";

export function SectionShell({
  eyebrow,
  heading,
  headingId,
  headingLevel,
  subheading,
  variant = "default",
  children,
  className,
}: {
  eyebrow?: string;
  heading: string;
  headingId: string;
  headingLevel: 2 | 3;
  subheading?: string;
  variant?: "default" | "hero";
  children?: React.ReactNode;
  className?: string;
}) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12",
        isHero
          ? "flex min-h-[inherit] flex-col justify-center py-20"
          : "border-t border-border py-20 sm:py-28 lg:py-32",
        className,
      )}
    >
      {!isHero && eyebrow ? (
        <span className="mb-4 block font-mono text-xs text-primary">
          {`// ${eyebrow.toLowerCase()}`}
        </span>
      ) : null}
      <SectionHeading id={headingId} level={headingLevel} size={isHero ? "display" : "default"}>
        {heading}
      </SectionHeading>
      {subheading ? (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed text-muted-foreground",
            isHero ? "max-w-xl sm:text-xl" : "max-w-2xl",
          )}
        >
          {subheading}
        </p>
      ) : null}
      {children ? <div className={cn(!isHero && "mt-10 sm:mt-14")}>{children}</div> : null}
    </div>
  );
}
