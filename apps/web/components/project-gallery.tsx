"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export interface ProjectGalleryImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
}

export function ProjectGallery({ images }: { images: ProjectGalleryImage[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div className="glass-panel overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={image.url} className="relative aspect-video min-w-0 flex-[0_0_100%]">
              <Image
                src={image.url}
                alt={image.altText ?? ""}
                fill
                sizes="(min-width: 640px) 48rem, 100vw"
                placeholder={image.blurDataUrl ? "blur" : undefined}
                blurDataURL={image.blurDataUrl ?? undefined}
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <>
          <div className="mt-6 flex items-center justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous image"
            disabled={!canScrollPrev}
            className="glass-panel absolute top-1/2 -left-4 hidden -translate-y-1/2 items-center justify-center rounded-full p-2 text-foreground transition-opacity disabled:opacity-30 sm:flex"
          >
            <LuChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next image"
            disabled={!canScrollNext}
            className="glass-panel absolute top-1/2 -right-4 hidden -translate-y-1/2 items-center justify-center rounded-full p-2 text-foreground transition-opacity disabled:opacity-30 sm:flex"
          >
            <LuChevronRight className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
