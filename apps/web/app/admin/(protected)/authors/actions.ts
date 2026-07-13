"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface ActionResult {
  error?: string;
}

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

function toAuthorData(values: Record<string, unknown>) {
  return {
    name: String(values.name ?? ""),
    slug: String(values.slug ?? ""),
    imageUrl: (values.imageUrl as string) || null,
    bio: (values.bio as string) || null,
    sameAs: Array.isArray(values.sameAs) ? (values.sameAs as string[]) : [],
  };
}

export async function createAuthorAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const created = await prisma.author.create({ data: toAuthorData(values) });
    await logAudit({ userId: user.id, action: "author.created", entity: "Author", entityId: created.id });
    return {};
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "That slug is already in use." };
    }
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateAuthorAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.author.update({ where: { id }, data: toAuthorData(values) });
    await logAudit({ userId: user.id, action: "author.updated", entity: "Author", entityId: id });
    return {};
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "That slug is already in use." };
    }
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteAuthorAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.author.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "author.deleted", entity: "Author", entityId: id });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}
