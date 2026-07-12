// Client-safe surface: generated model types and enums only. No Prisma
// client instance, no auth/cms/audit runtime — see server.ts (import from
// "@portfolio/db/server") for that. Kept separate so packages/sections and
// any admin UI component can depend on enums like SectionType without
// pulling Node-only driver code (pg, node:crypto) into the browser bundle.
export * from "./generated/client";
