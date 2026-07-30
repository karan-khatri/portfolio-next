import { Prisma } from "./generated/client";

// Prisma's upsert() isn't a single atomic SQL statement in this setup — under
// two concurrent callers racing the same unique key (e.g. two overlapping
// server cold starts both seeding on boot), the create branch can lose to a
// duplicate-key error instead of falling back to update. Retrying once
// re-reads the row the other caller just committed and takes the update
// branch instead, with no locking or blocking involved.
export async function withUniqueRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fn();
    }
    throw error;
  }
}
