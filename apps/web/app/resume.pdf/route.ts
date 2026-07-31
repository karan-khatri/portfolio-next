import { getSiteSettings } from "@portfolio/db/server";

export async function GET() {
  const settings = await getSiteSettings();
  if (!settings.resumeUrl) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(settings.resumeUrl);
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="resume.pdf"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
