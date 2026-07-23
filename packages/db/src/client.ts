import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;
const caCert = process.env.DATABASE_CA_CERT;

// Only trust DATABASE_CA_CERT when the connection string itself declares
// sslmode=require — a cert set in the environment (e.g. left over from
// prod config) must never force SSL onto an unrelated non-SSL DATABASE_URL
// (like a local Postgres container), which just fails the handshake outright.
const requiresSsl = Boolean(databaseUrl && new URL(databaseUrl).searchParams.get("sslmode") === "require");

function buildConnectionString(): string | undefined {
  if (!databaseUrl || !requiresSsl) return databaseUrl;
  const parsed = new URL(databaseUrl);
  parsed.searchParams.delete("sslmode");
  return parsed.toString();
}

const adapter = new PrismaPg({
  connectionString: buildConnectionString(),
  max: 1,
  ...(requiresSsl && caCert ? { ssl: { ca: caCert, rejectUnauthorized: true } } : {}),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
