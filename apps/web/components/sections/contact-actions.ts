"use server";

import { headers } from "next/headers";
import { prisma, getSiteSettings } from "@portfolio/db/server";
import { sendEmail, escapeHtml } from "@/lib/email";
import { resolveAppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export interface ContactFormResult {
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip");
}

export async function submitContactMessageAction(values: {
  name: string;
  email: string;
  message: string;
  company?: string;
}, localeInput?: string): Promise<ContactFormResult> {
  const locale = resolveAppLocale(localeInput);
  const errors = getDictionary(locale).contact.errors;
  // Honeypot: a field real users never see or fill in. Bots that
  // auto-fill every input on the form will trip it. Report success
  // without actually saving anything, so the bot doesn't learn it failed.
  if (values.company) {
    return {};
  }

  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name || !email || !message) {
    return { error: errors.fillEveryField };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: errors.invalidEmail };
  }
  if (message.length > 5000) {
    return { error: errors.tooLong };
  }

  const ipAddress = await getClientIp();
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recentCount = await prisma.contactMessage.count({
    where: ipAddress
      ? { ipAddress, createdAt: { gte: windowStart } }
      : { email, createdAt: { gte: windowStart } },
  });
  if (recentCount >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return { error: errors.rateLimited };
  }

  await prisma.contactMessage.create({ data: { name, email, message, ipAddress } });

  const settings = await getSiteSettings(locale);

  const notifyEmail = process.env.SEED_ADMIN_EMAIL;
  if (notifyEmail) {
    await sendEmail({
      to: notifyEmail,
      subject: `New contact message from ${name}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/messages">View in admin</a></p>
      `,
    });
  }

  if (settings.contactAutoReplyEnabled && settings.contactAutoReplySubject && settings.contactAutoReplyBody) {
    const subject = settings.contactAutoReplySubject.replaceAll("{{name}}", name);
    const body = settings.contactAutoReplyBody.replaceAll("{{name}}", name);
    await sendEmail({
      to: email,
      subject,
      html: `<p>${escapeHtml(body).replaceAll("\n", "<br>")}</p>`,
    });
  }

  return {};
}
