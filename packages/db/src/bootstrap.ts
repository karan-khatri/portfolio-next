import { prisma } from "./client";
import { hashPassword } from "./auth";
import { saveDraft, publishRevision } from "./cms";
import { resolveTagIds } from "./tags";

const RESUME_EXPERIENCE = [
  {
    company: "Concept Recall",
    title: "Full Stack AI Engineer",
    startDate: new Date("2022-12-01"),
    endDate: new Date("2025-01-01"),
    description:
      "<ul>" +
      "<li>Shipped AI-driven features end-to-end for Brarista, an AI-powered bra-fitting platform for e-commerce clients — designing PostgreSQL schemas, building Python (Flask, FastAPI) backends integrating ML models, and developing React/Next.js and Vue.js frontends for production users on live Shopify storefronts.</li>" +
      "<li>Stepped up to own backend delivery during a team shortage, learning AWS Lambda and API Gateway on the job to keep features on schedule.</li>" +
      "<li>Built AWS Lambda functions triggered by Shopify store events, processing real-time data through API Gateway, with system health monitored via AWS CloudWatch.</li>" +
      "<li>Packaged the Brarista fitting tool UI as a reusable React component library adopted by 2 internal teams, cutting integration time for new storefronts.</li>" +
      "<li>Built and maintained a Node.js/Express.js backend with optimized PostgreSQL schemas for an internal analytics dashboard, securing endpoints with JWT and bcrypt authentication.</li>" +
      "<li>Automated CI/CD pipelines with GitHub Actions and built out Cypress E2E test coverage across core user flows, cutting recurring post-deployment regressions.</li>" +
      "<li>Reviewed pull requests and onboarded new engineers across frontend and backend work.</li>" +
      "</ul>",
  },
  {
    company: "Fiverr (Level 1 Seller)",
    title: "Freelance Full Stack Developer",
    startDate: new Date("2021-05-01"),
    endDate: new Date("2022-12-01"),
    description:
      "<ul>" +
      "<li>Delivered 30+ projects for 15+ clients spanning REST API integrations, authentication systems, backend automation, and responsive React/Next.js frontends with custom animations.</li>" +
      "<li>Debugged cross-browser JavaScript and CSS issues for long-term clients.</li>" +
      "<li>Maintained a consistent 5-star client rating throughout.</li>" +
      "</ul>",
  },
];

const RESUME_EDUCATION = [
  {
    institution: "University of Florence (UNIFI)",
    degree: "Master's in Software: Science & Technology",
    location: "Firenze, IT",
    startDate: new Date("2024-09-01"),
    endDate: new Date("2026-08-01"),
    description:
      "<ul>" +
      "<li>Erasmus Nazionale exchange (6 months) at the University of Camerino (UNICAM), with coursework in software testing, multi-agent systems, and process mining.</li>" +
      "<li>Coursework in Distributed Systems Design and concurrent programming with Go, which motivated building GoChat independently.</li>" +
      "</ul>",
  },
  {
    institution: "Quaid-e-Awam University of Engineering, Science & Technology",
    degree: "BS in Information Technology",
    location: null,
    startDate: new Date("2018-10-01"),
    endDate: new Date("2022-10-01"),
    description:
      "<ul>" +
      "<li>CGPA 3.8/4.0, ranked 4th in graduating cohort.</li>" +
      "<li>Technical Team Member for TechnoMind-2k19, organizing 14+ technical competitions.</li>" +
      "</ul>",
  },
];

const RESUME_LANGUAGES = [
  { name: "English", proficiency: "Fluent (Professional Proficiency)" },
  { name: "Italian", proficiency: "Beginner (A1 Level)" },
];

const RESUME_SKILLS: Array<{ name: string; category: string }> = [
  ...["Python", "Go", "Node.js", "TypeScript", "SQL"].map((name) => ({ name, category: "Languages" })),
  ...["React", "Next.js", "Vue.js", "Angular", "Redux Toolkit", "Tailwind CSS", "Material UI", "Ant Design"].map(
    (name) => ({ name, category: "Frontend" }),
  ),
  ...["Flask", "FastAPI", "Express.js", "REST APIs", "WebSockets", "Microservices", "Repository Pattern"].map(
    (name) => ({ name, category: "Backend" }),
  ),
  ...["PostgreSQL", "MongoDB", "Redis"].map((name) => ({ name, category: "Databases" })),
  ...[
    "AWS Lambda",
    "AWS API Gateway",
    "AWS S3",
    "AWS CloudFront",
    "AWS LightSail",
    "AWS CloudWatch",
    "Docker",
    "GitHub Actions",
    "CI/CD",
  ].map((name) => ({ name, category: "Cloud & DevOps" })),
  ...["pytest", "Cypress (E2E)"].map((name) => ({ name, category: "Testing" })),
  ...["Git", "Jira", "Notion", "Linux"].map((name) => ({ name, category: "Tools" })),
];

const RESUME_PROJECTS = [
  {
    slug: "gochat",
    title: "GoChat — Distributed Messaging Platform",
    excerpt:
      "A distributed chat system in Go built with a microservices architecture, RabbitMQ event-driven messaging, and real-time WebSocket delivery.",
    body:
      "<ul>" +
      "<li>Designed a distributed chat system in Go using a microservices architecture (Messaging, Auth, User, Notification services) with the Repository Pattern for clean data access abstraction.</li>" +
      "<li>Integrated RabbitMQ for asynchronous inter-service communication and event-driven workflows; used PostgreSQL for persistent storage and Docker for full containerization.</li>" +
      "<li>Implemented WebSocket-based real-time messaging for low-latency client-to-service communication.</li>" +
      "</ul>",
    tags: ["Go", "PostgreSQL", "RabbitMQ", "Docker", "WebSockets", "Microservices"],
  },
  {
    slug: "brarista-ai-fitting-tool",
    title: "Brarista AI Fitting Tool",
    excerpt:
      "An AI-powered size-calculation backend for an e-commerce bra-fitting platform, serving real-time predictions to live Shopify storefronts.",
    body:
      "<ul>" +
      "<li>Built a Python (Flask, FastAPI) backend integrating ML models for AI-powered size calculation, exposing serverless endpoints via AWS Lambda and API Gateway for real-time Shopify event ingestion.</li>" +
      "<li>Transformed the fitting-tool frontend into a reusable React component library adopted by 2 internal teams, cutting integration time for new storefronts; static builds deployed to Shopify themes.</li>" +
      "<li>Debugged a multi-tenant response-routing issue where ML results weren't reliably matched to the correct store, causing some users to be stuck waiting or wrongly routed to a broken email-fallback flow; traced the logic across backend and frontend and corrected it without a full rewrite of the surrounding system.</li>" +
      "</ul>",
    tags: ["Python", "Flask", "FastAPI", "AWS Lambda", "API Gateway", "React", "TypeScript"],
  },
  {
    slug: "analytics-dashboard",
    title: "Analytics Dashboard",
    excerpt:
      "A full-stack analytics dashboard with a Node.js/Express backend and an ECharts-powered React frontend, powering internal decision-making.",
    body:
      "<ul>" +
      "<li>Developed the Node.js/Express.js backend and optimized PostgreSQL schemas for a full-stack analytics dashboard powering internal decision-making.</li>" +
      "<li>Built an ECharts-powered React frontend for data visualization.</li>" +
      "<li>Secured endpoints with JWT and bcrypt authentication; deployed on AWS LightSail for reliable, cost-efficient hosting.</li>" +
      "</ul>",
    tags: ["Node.js", "Express.js", "React", "PostgreSQL", "AWS LightSail"],
  },
  {
    slug: "distributed-notepad",
    title: "Distributed Notepad",
    excerpt:
      "A real-time collaborative document editor in Go with live multi-user editing, presence indicators, and version history.",
    body:
      "<ul>" +
      "<li>Built a real-time collaborative document editor in Go with live multi-user editing, presence indicators, and document version history with restore.</li>" +
      "<li>Implemented WebSocket-based broadcasting for instant synchronization across clients, with a layered handler/service/repository architecture and bcrypt/session-based authentication.</li>" +
      "</ul>",
    tags: ["Go", "Gin", "GORM", "WebSockets", "SQLite"],
  },
  {
    slug: "publishing-house-management-system",
    title: "Publishing House Management System",
    excerpt:
      "A full-stack management system for a publishing house, with an Angular frontend and a Jakarta EE backend supporting role-based access control.",
    body:
      "<ul>" +
      "<li>Built a full-stack management system with an Angular frontend and a Jakarta EE (JAX-RS) backend on WildFly, with JWT authentication and role-based access control across four roles.</li>" +
      "<li>Designed the PostgreSQL schema for employees, authors, and publications with many-to-many relationships; fully containerized with Docker Compose.</li>" +
      "</ul>",
    tags: ["Angular", "Jakarta EE", "PostgreSQL", "Docker"],
  },
  {
    slug: "pra-chat-app",
    title: "PRA Chat App",
    excerpt:
      "A real-time messaging application with WebSocket-based delivery, secure authentication, and a performance-tuned frontend.",
    body:
      "<ul>" +
      "<li>Built a real-time messaging application with WebSocket-based delivery, cutting message latency well below the polling-based prototype it replaced.</li>" +
      "<li>Implemented JWT and bcrypt authentication for secure access to channels; applied lazy loading, code-splitting, and a customizable theming system to cut initial load time.</li>" +
      "</ul>",
    tags: ["Node.js", "Express.js", "React", "MongoDB", "WebSockets"],
  },
];

async function seedResumeContent(adminId: string): Promise<void> {
  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: RESUME_EXPERIENCE.map((entry, index) => ({
        locale: "en",
        company: entry.company,
        title: entry.title,
        startDate: entry.startDate,
        endDate: entry.endDate,
        description: entry.description,
        order: index,
      })),
    });
  }

  if ((await prisma.education.count()) === 0) {
    await prisma.education.createMany({
      data: RESUME_EDUCATION.map((entry, index) => ({
        locale: "en",
        institution: entry.institution,
        degree: entry.degree,
        location: entry.location,
        startDate: entry.startDate,
        endDate: entry.endDate,
        description: entry.description,
        order: index,
      })),
    });
  }

  if ((await prisma.language.count()) === 0) {
    await prisma.language.createMany({
      data: RESUME_LANGUAGES.map((entry, index) => ({
        locale: "en",
        name: entry.name,
        proficiency: entry.proficiency,
        order: index,
      })),
    });
  }

  if ((await prisma.skill.count()) === 0) {
    await prisma.skill.createMany({
      data: RESUME_SKILLS.map((skill, index) => ({
        locale: "en",
        name: skill.name,
        category: skill.category,
        order: index,
      })),
    });
  }

  for (const entry of RESUME_PROJECTS) {
    const project = await prisma.project.upsert({
      where: { slug_locale: { slug: entry.slug, locale: "en" } },
      update: {},
      create: {
        slug: entry.slug,
        locale: "en",
        translationGroupId: entry.slug,
        title: entry.title,
        status: "DRAFT",
      },
    });

    if (project.status !== "PUBLISHED") {
      const tagIds = await resolveTagIds(entry.tags);
      const revision = await saveDraft({
        entityType: "Project",
        entityId: project.id,
        data: {
          title: entry.title,
          excerpt: entry.excerpt,
          body: entry.body,
          tagIds,
        },
        userId: adminId,
      });
      await publishRevision({
        entityType: "Project",
        entityId: project.id,
        revisionId: revision.id,
        userId: adminId,
      });
    }
  }
}

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

  await seedResumeContent(admin.id);
}
