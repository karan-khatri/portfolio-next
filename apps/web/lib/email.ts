import "server-only";
import { Resend } from "resend";

// Email bodies are HTML — any user-controlled string (a contact form name/
// message, an invited email address) interpolated into one must be escaped,
// or it can inject markup/scripts into whatever renders the email client-side.
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL;
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * No-ops (with a console log) when RESEND_API_KEY/RESEND_FROM_EMAIL aren't
 * set, same pattern as lib/storage picking an adapter by env presence —
 * email notifications are a nice-to-have, never something that should block
 * the action that triggered them (contact form submit, invite creation).
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend || !from) {
    console.log(`[email] Not configured, skipping "${params.subject}" to ${params.to}`);
    return;
  }

  try {
    await resend.emails.send({ from, to: params.to, subject: params.subject, html: params.html });
  } catch (error) {
    console.error("[email] Failed to send:", error);
  }
}
