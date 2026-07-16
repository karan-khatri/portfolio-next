import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const caCert = process.env.DATABASE_CA_CERT;

function buildConnectionString(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !caCert) return url;
  const parsed = new URL(url);
  parsed.searchParams.delete("sslmode");
  return parsed.toString();
}

const adapter = new PrismaPg({
  connectionString: buildConnectionString(),
  max: 1,
  ...(caCert ? { ssl: { ca: caCert, rejectUnauthorized: true } } : {}),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
