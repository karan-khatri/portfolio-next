import type { AboutContent } from "@portfolio/sections";
import { GlobeIcon, GraduationCapIcon, MapPinIcon, TerminalIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";
import { ProseContent } from "@/components/prose-content";
import type { SectionImage } from "./hero";

const QUICK_FACTS = [
  { icon: MapPinIcon, label: "Location — Florence, Italy" },
  { icon: TerminalIcon, label: "Focus — Backend + AI/RAG" },
  { icon: GraduationCapIcon, label: "Education — MSc, Univ. of Florence (2026)" },
  { icon: GlobeIcon, label: "Status — Open to remote roles" },
] as const;

export function AboutSection({
  id,
  content,
  headingLevel,
  image,
}: Readonly<{
  id: string;
  content: AboutContent;
  headingLevel: 2 | 3;
  image: SectionImage | null;
}>) {
  return (
    <SectionShell eyebrow="About" headingId={id} headingLevel={headingLevel} heading={content.heading}>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal className="order-2 space-y-6 lg:order-1">
          <div className="glass-panel glow-primary rounded-xl p-6 transition-all duration-300">
            <ProseContent html={content.body} className="text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUICK_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="glass-panel flex items-center gap-3 rounded-lg p-4"
              >
                <fact.icon className="size-5 shrink-0 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">{fact.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {image ? (
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <img
              src={image.url}
              alt={image.altText ?? ""}
              width={image.width ?? undefined}
              height={image.height ?? undefined}
              className="glass-panel aspect-square w-full rounded-2xl object-cover lg:aspect-4/3"
            />
          </Reveal>
        ) : null}
      </div>
    </SectionShell>
  );
}
