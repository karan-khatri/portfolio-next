import { prisma } from "./client";
import { withUniqueRetry } from "./upsert-retry";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function resolveTagIds(names: string[]): Promise<string[]> {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];

  const tags = await Promise.all(
    unique.map((name) =>
      withUniqueRetry(() =>
        prisma.tag.upsert({
          where: { slug: slugify(name) },
          update: {},
          create: { slug: slugify(name), name },
        }),
      ),
    ),
  );

  return tags.map((tag) => tag.id);
}
