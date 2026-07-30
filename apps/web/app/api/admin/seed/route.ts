import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";
import { ensureSeedData } from "@portfolio/db/server";
import { apiSuccess, apiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.SEED_API_SECRET;
  const provided = request.headers.get("x-seed-secret");
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return apiError("Unauthorized", { status: StatusCodes.UNAUTHORIZED });
  }

  try {
    await ensureSeedData();
    return apiSuccess({}, "Seed data ensured");
  } catch (error) {
    return apiError("Seeding failed", {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
