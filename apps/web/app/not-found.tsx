import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { PublicShell } from "@/components/public-shell";
import { getPublicNav } from "@/lib/public-nav";

export default async function NotFound() {
  const { navItems, settings } = await getPublicNav();

  return (
    <PublicShell
      title={settings.title}
      navItems={navItems}
      resumeUrl={settings.resumeUrl}
      githubUrl={settings.githubUrl}
      linkedinUrl={settings.linkedinUrl}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-6 py-32 sm:px-8 lg:px-12">
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes -- deliberate "styled like a comment" display text, not a real comment */}
        <span className="font-mono text-xs text-primary">// 404</span>
        <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Nothing lives at this address — the page may have been unpublished or the link is wrong.
        </p>
        <Link href="/" className="group mt-8 inline-flex items-center gap-2 font-mono text-xs text-primary">
          <LuArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back home
        </Link>
      </div>
    </PublicShell>
  );
}
