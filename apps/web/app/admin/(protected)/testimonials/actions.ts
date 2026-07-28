"use server";

import { prisma, logAudit } from "@portfolio/db/server";
import { requireEditor } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/admin/action-result";

export async function createTestimonialAction(values: Record<string, unknown>): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const count = await prisma.testimonial.count();
    const created = await prisma.testimonial.create({
      data: {
        locale: "en",
        authorName: String(values.authorName ?? ""),
        authorRole: (values.authorRole as string) || null,
        quote: String(values.quote ?? ""),
        avatarUrl: (values.avatarUrl as string) || null,
        order: count,
      },
    });
    await logAudit({
      userId: user.id,
      action: "testimonial.created",
      entity: "Testimonial",
      entityId: created.id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create" };
  }
}

export async function updateTestimonialAction(
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.testimonial.update({
      where: { id },
      data: {
        authorName: String(values.authorName ?? ""),
        authorRole: (values.authorRole as string) || null,
        quote: String(values.quote ?? ""),
        avatarUrl: (values.avatarUrl as string) || null,
      },
    });
    await logAudit({
      userId: user.id,
      action: "testimonial.updated",
      entity: "Testimonial",
      entityId: id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await prisma.testimonial.delete({ where: { id } });
    await logAudit({
      userId: user.id,
      action: "testimonial.deleted",
      entity: "Testimonial",
      entityId: id,
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete" };
  }
}

export async function reorderTestimonialAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.testimonial.update({ where: { id }, data: { order: index } }),
      ),
    );
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reorder" };
  }
}
