import { cn } from "@/lib/utils";
import { SectionHeading } from "./heading";

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
} as const;

export function SectionShell({
  id,
  eyebrow,
  showEyebrow = true,
  heading,
  headingLevel,
  headingAlign = "left",
  subheading,
  variant = "default",
  children,
  className,
}: {
  id: string;
  eyebrow?: string;
  showEyebrow?: boolean;
  heading: string;
  headingLevel: 2 | 3;
  headingAlign?: "left" | "center" | "right";
  subheading?: string;
  variant?: "default" | "hero";
  children?: React.ReactNode;
  className?: string;
}) {
  const isHero = variant === "hero";

  return (
    <div
      id={id}
      className={cn(
        "mx-auto w-full max-w-7xl scroll-mt-20 px-6 sm:px-8 lg:px-12 py-20",
        isHero
          ? "flex min-h-[inherit] flex-col justify-center"
          : "border-t border-border",
        className,
      )}
    >
      <div className={cn(!isHero && ALIGN_CLASS[headingAlign])}>
        {!isHero && eyebrow && showEyebrow ? (
          <span className="mb-4 block font-mono text-xs text-primary">
            {`// ${eyebrow.toLowerCase()}`}
          </span>
        ) : null}
        <SectionHeading level={headingLevel} size={isHero ? "display" : "default"}>
          {heading}
        </SectionHeading>
        {subheading ? (
          <p
            className={cn(
              "mt-4 text-lg leading-relaxed text-muted-foreground",
              isHero ? "max-w-xl sm:text-xl" : "max-w-2xl",
              !isHero && ALIGN_CLASS[headingAlign],
            )}
          >
            {subheading}
          </p>
        ) : null}
      </div>
      {children ? <div className={cn(!isHero && "mt-10 sm:mt-14")}>{children}</div> : null}
    </div>
  );
}
