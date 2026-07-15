import type { SectionNavItem } from "@/components/sections/section-renderer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function PublicShell({
  title,
  navItems,
  resumeUrl,
  githubUrl,
  linkedinUrl,
  children,
}: {
  title: string;
  navItems: SectionNavItem[];
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div id="top" className="theme-site min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <SiteHeader title={title} navItems={navItems} resumeUrl={resumeUrl} />
      <MotionProvider>
        <main id="main-content" className="pt-20">
          {children}
        </main>
      </MotionProvider>
      <SiteFooter title={title} githubUrl={githubUrl} linkedinUrl={linkedinUrl} />
    </div>
  );
}
