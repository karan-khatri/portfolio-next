import type { HeroContent } from "@portfolio/sections";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./heading";

export interface SectionImage {
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  altText: string | null;
}

export function HeroSection({
  id,
  content,
  headingLevel,
  image,
}: {
  id: string;
  content: HeroContent;
  headingLevel: 2 | 3;
  image: SectionImage | null;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col items-center gap-12 px-6 py-20 sm:px-8 lg:flex-row lg:px-12">
      <div className="flex w-full flex-col gap-6 lg:w-1/2">
        <span className="inline-flex items-center gap-2 font-mono text-sm text-primary">
          <span className="text-secondary opacity-70">~</span>
          $ whoami
          <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
        </span>
        <SectionHeading id={id} level={headingLevel} size="display">
          {content.heading}
        </SectionHeading>
        {content.subheading ? (
          <p className="max-w-125 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {content.subheading}
          </p>
        ) : null}
        {content.ctaLabel && content.ctaHref ? (
          <a
            href={content.ctaHref}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-2 w-fit font-heading text-sm font-semibold",
            )}
          >
            {content.ctaLabel}
            <ArrowRightIcon />
          </a>
        ) : null}
        <div className="mt-2 flex items-center gap-3">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Open to remote roles
          </span>
        </div>
      </div>

      <div className="w-full lg:w-1/2">
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? ""}
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            className="glass-panel w-full rounded-lg object-cover shadow-2xl"
          />
        ) : (
          <div className="glass-panel w-full overflow-hidden rounded-lg shadow-2xl">
            <div className="flex h-10 items-center gap-2 border-b border-border/50 bg-card/50 px-4">
              <span className="size-3 rounded-full bg-[#ff5f56]" />
              <span className="size-3 rounded-full bg-[#ffbd2e]" />
              <span className="size-3 rounded-full bg-[#27c93f]" />
              <span className="mx-auto font-mono text-xs text-muted-foreground/50">
                rag_pipeline.py
              </span>
            </div>
            <pre className="overflow-auto p-6 font-mono text-sm leading-relaxed whitespace-pre">
              <span className="text-secondary">def</span>{" "}
              <span className="text-primary">query_rag</span>(prompt):
              {"\n"}
              {"    "}chunks = db.search(embeddings.embed(prompt))
              {"\n"}
              {"    "}context = <span className="text-accent">&quot;\n&quot;</span>.join([c.text{" "}
              <span className="text-secondary">for</span> c{" "}
              <span className="text-secondary">in</span> chunks])
              {"\n"}
              {"    "}
              <span className="text-secondary">return</span> llm.generate(
              <span className="text-accent">f&quot;Context: {"{context}"}\nPrompt: {"{prompt}"}&quot;</span>
              ){"\n\n"}
              <span className="text-muted-foreground"># Awaiting input...</span>
              {"\n"}_
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
