import "server-only";
import { cookies } from "next/headers";
import { verifySessionToken } from "@portfolio/db/server";
import { SESSION_COOKIE } from "./constants";

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
