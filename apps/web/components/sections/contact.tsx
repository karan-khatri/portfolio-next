import type { ContactContent } from "@portfolio/sections";
import { LuMail, LuMapPin, LuChevronRight } from "react-icons/lu";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { SiUpwork, SiFiverr } from "react-icons/si";
import { ContactForm } from "./contact-form";
import { SectionShell } from "./section-shell";

const SOCIAL_LINKS = [
  { key: "github", Icon: FaGithub, label: "GitHub" },
  { key: "linkedin", Icon: FaLinkedin, label: "LinkedIn" },
  { key: "upwork", Icon: SiUpwork, label: "Upwork" },
  { key: "fiverr", Icon: SiFiverr, label: "Fiverr" },
  { key: "instagram", Icon: FaInstagram, label: "Instagram" },
] as const;

export function ContactSection({
  id,
  content,
  headingLevel,
  githubUrl,
  linkedinUrl,
  upworkUrl,
  fiverrUrl,
  instagramUrl,
  location,
}: Readonly<{
  id: string;
  content: ContactContent;
  headingLevel: 2 | 3;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  upworkUrl?: string | null;
  fiverrUrl?: string | null;
  instagramUrl?: string | null;
  location?: string | null;
}>) {
  const urlsByKey: Record<(typeof SOCIAL_LINKS)[number]["key"], string | null | undefined> = {
    github: githubUrl,
    linkedin: linkedinUrl,
    upwork: upworkUrl,
    fiverr: fiverrUrl,
    instagram: instagramUrl,
  };
  const socialLinks = SOCIAL_LINKS.filter((social) => urlsByKey[social.key]);

  return (
    <SectionShell
      eyebrow="Contact"
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <div className="space-y-8 lg:pr-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">
              System online
            </span>
          </div>

          <div className="space-y-3">
            <a
              href={`mailto:${content.email}`}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card/30 p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LuMail className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Email
                </p>
                <p className="truncate text-sm font-semibold">{content.email}</p>
              </div>
              <LuChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </a>

            {location ? (
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/30 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LuMapPin className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    Location
                  </p>
                  <p className="truncate text-sm font-semibold">{location}</p>
                </div>
              </div>
            ) : null}
          </div>

          {socialLinks.length > 0 ? (
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                Find me elsewhere
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={urlsByKey[social.key] ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-11 items-center justify-center rounded-full border border-border/60 bg-card/30 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                    aria-label={social.label}
                  >
                    <social.Icon className="size-4.5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:pl-3">
          <ContactForm />
        </div>
      </div>
    </SectionShell>
  );
}
