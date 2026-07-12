import { cookies } from "next/headers";
import { destroySessionToken } from "@portfolio/db/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { apiSuccess } from "@/lib/api/response";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await destroySessionToken(token);
  }
  store.delete(SESSION_COOKIE);
  return apiSuccess({}, "Signed out");
}
