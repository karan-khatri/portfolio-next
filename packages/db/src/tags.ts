import { prisma } from "./client";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Turns typed tag names into real Tag rows (upsert-by-slug) and returns
// their ids, so a draft can store plain strings while the live relation
// (set at publish time) always points at real rows.
export async function resolveTagIds(names: string[]): Promise<string[]> {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];

  const tags = await Promise.all(
    unique.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { slug: slugify(name), name },
      }),
    ),
  );

  return tags.map((tag) => tag.id);
}
