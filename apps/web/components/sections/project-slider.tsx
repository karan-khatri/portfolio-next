"use client";

import { useEffect, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { ProjectCard, type ProjectCardItem } from "./project-card";

export function ProjectSlider({ items }: { items: ProjectCardItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function handleScroll() {
      if (!track) return;
      const slideWidth = track.scrollWidth / items.length;
      setActiveIndex(Math.round(track.scrollLeft / slideWidth));
    }

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.scrollWidth / items.length;
    track.scrollTo({ left: slideWidth * index, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((project) => (
          <div key={project.id} className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[40%]">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <>
          <div className="mt-6 flex items-center justify-center gap-2">
            {items.map((project, index) => (
              <button
                key={project.id}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            aria-label="Previous project"
            disabled={activeIndex === 0}
            className="glass-panel absolute top-1/2 -left-4 hidden -translate-y-1/2 items-center justify-center rounded-full p-2 text-foreground transition-opacity disabled:opacity-30 sm:flex"
          >
            <LuChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(items.length - 1, activeIndex + 1))}
            aria-label="Next project"
            disabled={activeIndex === items.length - 1}
            className="glass-panel absolute top-1/2 -right-4 hidden -translate-y-1/2 items-center justify-center rounded-full p-2 text-foreground transition-opacity disabled:opacity-30 sm:flex"
          >
            <LuChevronRight className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
