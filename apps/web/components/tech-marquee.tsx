import { cn } from "@/lib/utils";
import { TECH_STACK_ICON_BY_NAME, DEFAULT_TECH_STACK_ICON } from "@/lib/tech-stack";

export interface TechMarqueeItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

export function TechMarquee({ items }: { items: TechMarqueeItem[] }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="group overflow-hidden py-4 mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex w-max animate-[marquee-x_32s_linear_infinite] group-hover:paused motion-reduce:paused">
          {doubled.map((item, index) => {
            const Icon = TECH_STACK_ICON_BY_NAME[item.name] ?? DEFAULT_TECH_STACK_ICON;
            const bobDirection = index % 2 === 0 ? "bob-up-down" : "bob-down-up";
            return (
              <span
                key={`${item.id}-${index}`}
                title={item.name}
                aria-label={item.name}
                className={cn(
                  "glass-panel mr-5 flex size-18 shrink-0 items-center justify-center rounded-lg motion-safe:animate-[var(--bob-anim)_2.4s_ease-in-out_infinite] group-hover:paused",
                )}
                style={{ "--bob-anim": bobDirection } as React.CSSProperties}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-10 object-contain grayscale transition-all duration-300 hover:grayscale-0"
                  />
                ) : (
                  <Icon className="size-8 text-foreground/70 transition-colors duration-300 hover:text-primary" />
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
