import Image from "next/image";
import type { HeroContent } from "@portfolio/sections";
import { LuArrowRight } from "react-icons/lu";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./heading";

const HERO_SOCIAL_LINKS = [
  { key: "github", Icon: FaGithub, label: "GitHub" },
  { key: "linkedin", Icon: FaLinkedin, label: "LinkedIn" },
] as const;

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
  githubUrl,
  linkedinUrl,
}: Readonly<{
  id: string;
  content: HeroContent;
  headingLevel: 1 | 2 | 3;
  image: SectionImage | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}>) {
  const urlsByKey: Record<(typeof HERO_SOCIAL_LINKS)[number]["key"], string | null | undefined> = {
    github: githubUrl,
    linkedin: linkedinUrl,
  };
  const socialLinks = HERO_SOCIAL_LINKS.filter((social) => urlsByKey[social.key]);
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col-reverse items-center gap-12 px-6 py-20 sm:px-8 lg:flex-row lg:px-12">
      <div className="flex w-full flex-col items-center gap-6 text-center lg:w-1/2 lg:items-start lg:text-left">
        <span className="inline-flex items-center gap-2 font-mono text-sm text-primary">
          <span className="text-secondary opacity-70">~</span>
          {" "}
          $ whoami
          <span className="inline-block h-4 w-2 bg-primary animate-pulse" />
        </span>
        <SectionHeading id={id} level={headingLevel} size="display">
          {content.heading}
        </SectionHeading>
        {content.subheading ? (
          <p className="max-w-125 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {content.subheading}
          </p>
        ) : null}
        {(content.ctaLabel && content.ctaHref) || socialLinks.length > 0 ? (
          <div className="mt-2 flex w-fit items-center gap-3">
            {content.ctaLabel && content.ctaHref ? (
              <a
                href={content.ctaHref}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "font-heading text-sm font-semibold",
                )}
              >
                {content.ctaLabel}
                <LuArrowRight />
              </a>
            ) : null}
            {socialLinks.map((social) => (
              <a
                key={social.key}
                href={urlsByKey[social.key] ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                aria-label={social.label}
              >
                <social.Icon className="size-5" />
              </a>
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex items-center gap-3">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Open to remote roles
          </span>
        </div>
      </div>

      <div className="w-full lg:w-1/2">
        {image ? (
          <div className="group relative mx-auto aspect-square w-full max-w-xs sm:max-w-sm lg:max-w-md">
            <div className="absolute inset-0 rotate-3 rounded-2xl transition-transform duration-500 ease-out group-hover:rotate-0">
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 bg-card/20 shadow-2xl" />
            </div>
            <div className="absolute inset-0 -rotate-3 overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 ease-out group-hover:rotate-0">
              <Image
                src={image.url}
                alt={image.altText ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 20rem"
                placeholder={image.blurDataUrl ? "blur" : undefined}
                blurDataURL={image.blurDataUrl ?? undefined}
                className="object-cover grayscale transition-all duration-500 ease-out group-hover:grayscale-0"
              />
            </div>
          </div>
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
              {" "}
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
