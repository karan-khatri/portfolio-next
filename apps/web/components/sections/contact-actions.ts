"use server";

import { prisma } from "@portfolio/db/server";

export interface ContactFormResult {
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

export async function submitContactMessageAction(values: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactFormResult> {
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name || !email || !message) {
    return { error: "Please fill in every field." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (message.length > 5000) {
    return { error: "Message is too long." };
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recentCount = await prisma.contactMessage.count({
    where: { email, createdAt: { gte: windowStart } },
  });
  if (recentCount >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return { error: "You've sent a few messages already — please wait a bit before sending more." };
  }

  await prisma.contactMessage.create({ data: { name, email, message } });
  return {};
}
