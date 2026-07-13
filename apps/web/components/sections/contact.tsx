import type { ContactContent } from "@portfolio/sections";
import { LinkIcon, MailIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "./section-shell";

export function ContactSection({
  id,
  content,
  headingLevel,
  githubUrl,
  linkedinUrl,
}: {
  id: string;
  content: ContactContent;
  headingLevel: 2 | 3;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}) {
  return (
    <SectionShell
      eyebrow="Contact"
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      className="text-center"
    >
      <Reveal className="flex flex-col items-center gap-6">
        <a
          href={`mailto:${content.email}`}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-heading text-lg font-bold text-primary-foreground transition-all hover:shadow-[0_0_20px_var(--ring)]"
        >
          <MailIcon className="size-5" />
          {content.ctaLabel ?? "Send an Email"}
        </a>
        {githubUrl || linkedinUrl ? (
          <div className="flex gap-4">
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-panel flex size-14 items-center justify-center rounded-xl text-muted-foreground transition-all hover:text-primary"
                aria-label="GitHub"
              >
                <LinkIcon className="size-5" />
              </a>
            ) : null}
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-panel flex size-14 items-center justify-center rounded-xl text-muted-foreground transition-all hover:text-primary"
                aria-label="LinkedIn"
              >
                <LinkIcon className="size-5" />
              </a>
            ) : null}
          </div>
        ) : null}
      </Reveal>
    </SectionShell>
  );
}
