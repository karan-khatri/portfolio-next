import Image from "next/image";
import type { AboutContent } from "@portfolio/sections";
import { SectionShell } from "./section-shell";
import { ProseContent } from "@/components/prose-content";
import type { SectionImage } from "./hero";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function AboutSection({
  locale,
  id,
  content,
  headingLevel,
  image,
}: Readonly<{
  locale: AppLocale;
  id: string;
  content: AboutContent;
  headingLevel: 1 | 2 | 3;
  image: SectionImage | null;
}>) {
  const t = getDictionary(locale);
  const stats = [
    { label: t.about.location, value: content.location },
    { label: t.about.focus, value: content.focusTag },
    { label: t.about.education, value: content.education },
  ].filter((stat) => stat.value);

  const terminalLines = [
    { label: t.about.role, value: content.role },
    { label: t.about.focus, value: content.focusDetail },
    { label: t.about.currently, value: content.currently },
  ].filter((line) => line.value);

  return (
    <SectionShell
      eyebrow={t.eyebrow.about}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
        <div className="flex flex-col">
          <ProseContent html={content.body} className="text-muted-foreground" />
          {stats.length > 0 ? (
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border/60 pt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-1.5 font-mono text-sm font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {image ? (
          <div className="glass-panel relative h-full min-h-96 w-full overflow-hidden rounded-2xl lg:max-w-xl">
            <Image
              src={image.url}
              alt={image.altText || content.heading}
              fill
              sizes="(min-width: 1024px) 36rem, 100vw"
              placeholder={image.blurDataUrl ? "blur" : undefined}
              blurDataURL={image.blurDataUrl ?? undefined}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl shadow-2xl lg:max-w-xl">
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border/50 bg-card/50 px-4">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
                <span className="mx-auto font-mono text-xs text-muted-foreground/50">
                  {content.terminalTitle ?? "guest@portfolio: ~"}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 font-mono text-sm leading-relaxed">
                <div>
                  <span className="text-primary">$</span> whoami
                  {" "}
                  <span className="inline-block h-4 w-2 bg-primary animate-pulse" />
                </div>
                {terminalLines.length > 0 ? (
                  <div className="flex flex-col gap-2 text-muted-foreground">
                    {terminalLines.map((line) => (
                      <div key={line.label}>
                        <span className="text-primary">{line.label}:</span> {line.value}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            {content.status ? (
              <div className="hidden lg:block mt-8 border-t border-border/60 pt-6 lg:max-w-xl">
                <p className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">{t.about.status}</p>
                <p className="mt-1.5 font-mono text-sm font-semibold">{content.status}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
