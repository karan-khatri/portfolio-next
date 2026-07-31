import { prisma, getSiteSettings } from "@portfolio/db/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function section(title: string, lines: string[]): string {
  if (lines.length === 0) return "";
  return `## ${title}\n\n${lines.join("\n")}\n`;
}

export async function GET() {
  const settings = await getSiteSettings();

  const [pages, projects, posts] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLISHED", slug: { not: "home" }, OR: [{ seo: null }, { seo: { noindex: false } }] },
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.project.findMany({
      where: { status: "PUBLISHED", OR: [{ seo: null }, { seo: { noindex: false } }] },
      select: { slug: true, title: true, excerpt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", OR: [{ seo: null }, { seo: { noindex: false } }] },
      select: { slug: true, title: true, excerpt: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const projectLines = projects.map(
    (p) => `- [${p.title}](${siteUrl}/projects/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`,
  );
  const postLines = posts.map(
    (p) => `- [${p.title}](${siteUrl}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`,
  );
  const pageLines = pages.map((p) => `- [${p.title}](${siteUrl}/${p.slug})`);

  const blocks = [
    `# ${settings.title}\n\n> ${settings.description}`,
    settings.location ? `Based in ${settings.location}.` : "",
    section("Projects", projectLines),
    section("Blog", postLines),
    section("Pages", pageLines),
    section(
      "Links",
      [
        `- [Full project index](${siteUrl}/projects)`,
        `- [Blog index](${siteUrl}/blog)`,
        settings.resumeUrl ? `- [Resume (PDF)](${siteUrl}/resume.pdf)` : "",
        settings.githubUrl ? `- [GitHub](${settings.githubUrl})` : "",
        settings.linkedinUrl ? `- [LinkedIn](${settings.linkedinUrl})` : "",
      ].filter(Boolean),
    ),
  ];

  const body = blocks.filter(Boolean).join("\n\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
