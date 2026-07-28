"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { acceptInvite, createSession } from "@portfolio/db/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { ActionResult } from "@/lib/admin/action-result";

export async function acceptInviteAction(token: string, password: string): Promise<ActionResult> {
  if (password.length < 8) {
    return { error: "A password of at least 8 characters is required" };
  }

  const user = await acceptInvite(token, password);
  if (!user) {
    return { error: "Invite is invalid or expired" };
  }

  const { token: sessionToken, expiresAt } = await createSession(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  redirect("/admin");
}
