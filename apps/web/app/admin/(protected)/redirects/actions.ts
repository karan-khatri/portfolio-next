"use server";

import { revalidatePath } from "next/cache";
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

function toRedirectData(values: Record<string, unknown>) {
  return {
    fromPath: String(values.fromPath ?? ""),
    toPath: String(values.toPath ?? ""),
    statusCode: values.permanent ? 308 : 307,
  };
}

export async function createRedirectAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const created = await prisma.redirect.create({ data: toRedirectData(values) });
    await logAudit({ userId: user.id, action: "redirect.created", entity: "Redirect", entityId: created.id });
    revalidatePath("/");
    return {};
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A redirect from that path already exists." };
    }
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateRedirectAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.redirect.update({ where: { id }, data: toRedirectData(values) });
    await logAudit({ userId: user.id, action: "redirect.updated", entity: "Redirect", entityId: id });
    revalidatePath("/");
    return {};
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A redirect from that path already exists." };
    }
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteRedirectAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.redirect.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "redirect.deleted", entity: "Redirect", entityId: id });
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}
