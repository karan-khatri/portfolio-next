"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLoginRateLimited, verifyLoginCredentials, createSession } from "@portfolio/db/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { ActionResult } from "@/lib/admin/action-result";

export async function loginAction(email: string, password: string): Promise<ActionResult> {
  if (await isLoginRateLimited(email)) {
    return { error: "Too many attempts. Try again later." };
  }

  const user = await verifyLoginCredentials(email, password);
  if (!user) {
    return { error: "Invalid credentials" };
  }

  const { token, expiresAt } = await createSession(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  redirect("/admin");
}
