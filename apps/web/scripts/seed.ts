import {
  prisma,
  hashPassword,
  saveDraft,
  publishRevision,
  SectionType,
  type PageRevisionData,
} from "@portfolio/db/server";
import { sectionRegistry, validateSectionContent } from "@portfolio/sections";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "dev-password-change-me";

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", isPermanent: true },
  });
  await prisma.role.upsert({
    where: { name: "EDITOR" },
    update: {},
    create: { name: "EDITOR", isPermanent: false },
  });

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: "Admin",
      passwordHash: hashPassword(ADMIN_PASSWORD),
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

  const heroContent = validateSectionContent(SectionType.HERO, {
    ...sectionRegistry[SectionType.HERO].defaultContent(),
    heading: "Hi, I'm Kamlesh",
    subheading: "I build things for the web.",
  });
  const aboutContent = validateSectionContent(SectionType.ABOUT, {
    ...sectionRegistry[SectionType.ABOUT].defaultContent(),
    heading: "About me",
    body: "A short bio goes here.",
  });
  const contactContent = validateSectionContent(SectionType.CONTACT, {
    ...sectionRegistry[SectionType.CONTACT].defaultContent(),
    heading: "Get in touch",
    email: "hello@example.com",
  });

  const data: PageRevisionData = {
    title: "Home",
    sections: [
      { type: SectionType.HERO, order: 0, enabled: true, content: heroContent },
      { type: SectionType.ABOUT, order: 1, enabled: true, content: aboutContent },
      { type: SectionType.CONTACT, order: 2, enabled: true, content: contactContent },
    ],
  };

  const revision = await saveDraft({
    entityType: "Page",
    entityId: homePage.id,
    data,
    userId: admin.id,
  });

  await publishRevision({
    entityType: "Page",
    entityId: homePage.id,
    revisionId: revision.id,
    userId: admin.id,
  });

  console.log(
    JSON.stringify(
      { adminEmail: ADMIN_EMAIL, adminPassword: ADMIN_PASSWORD, pageId: homePage.id },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
