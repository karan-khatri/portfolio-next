import { cn } from "@/lib/utils";

export function SectionHeading({
  level,
  id,
  size = "default",
  className,
  children,
}: {
  level: 2 | 3;
  id?: string;
  size?: "default" | "display";
  className?: string;
  children: React.ReactNode;
}) {
  const sizeClasses =
    size === "display"
      ? "font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95]"
      : level === 2
        ? "font-heading text-3xl sm:text-4xl font-semibold tracking-tight"
        : "font-heading text-2xl sm:text-3xl font-semibold tracking-tight";

  const combined = cn(sizeClasses, className);

  if (level === 2) {
    return (
      <h2 id={id} className={combined}>
        {children}
      </h2>
    );
  }
  return (
    <h3 id={id} className={combined}>
      {children}
    </h3>
  );
}
