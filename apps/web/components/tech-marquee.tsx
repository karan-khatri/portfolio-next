import { cn } from "@/lib/utils";
import { TECH_STACK_ROW_1, TECH_STACK_ROW_2, type TechStackItem } from "@/lib/tech-stack";

function MarqueeRow({ items, reverse }: { items: TechStackItem[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  return (
    <div className="group overflow-hidden mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div
        className={cn(
          "flex w-max animate-[marquee-x_32s_linear_infinite] group-hover:paused motion-reduce:paused",
          reverse && "shimmer-reverse",
        )}
      >
        {doubled.map((item, index) => (
          <span
            key={`${item.name}-${index}`}
            title={item.name}
            aria-label={item.name}
            className="glass-panel mr-4 flex size-14 shrink-0 items-center justify-center rounded-lg"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="size-8 object-contain grayscale transition-all duration-300 hover:grayscale-0"
              />
            ) : (
              <item.Icon className="size-6 text-foreground/70 transition-colors duration-300 hover:text-primary" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechMarquee() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 space-y-4">
      <MarqueeRow items={TECH_STACK_ROW_1} />
      <MarqueeRow items={TECH_STACK_ROW_2} reverse />
    </div>
  );
}
