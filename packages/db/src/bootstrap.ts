import { prisma } from "./client";
import { hashPassword } from "./auth";
import { saveDraft, publishRevision } from "./cms";

export async function ensureSeedData(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must both be set — refusing to start without them.",
    );
  }

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", isPermanent: true },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash: hashPassword(adminPassword),
    },
  });

  const hasAdminRole = await prisma.userRoleAssignment.findFirst({
    where: { userId: admin.id, roleId: adminRole.id },
  });
  if (!hasAdminRole) {
    await prisma.userRoleAssignment.create({
      data: { userId: admin.id, roleId: adminRole.id, expiresAt: null },
    });
  }

  const homePage = await prisma.page.upsert({
    where: { slug_locale: { slug: "home", locale: "en" } },
    update: {},
    create: {
      slug: "home",
      locale: "en",
      translationGroupId: "home",
      title: "Home",
      status: "DRAFT",
    },
  });

  if (homePage.status !== "PUBLISHED") {
    const revision = await saveDraft({
      entityType: "Page",
      entityId: homePage.id,
      data: { title: "Home", sections: [] },
      userId: admin.id,
    });
    await publishRevision({
      entityType: "Page",
      entityId: homePage.id,
      revisionId: revision.id,
      userId: admin.id,
    });
  }
}
