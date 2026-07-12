// Shared by proxy.ts (edge runtime, no DB access — cookie-presence check
// only) and the Node-runtime route handlers/server components that do the
// real, DB-backed verification. Kept dependency-free so proxy.ts can import
// it without pulling in @portfolio/db.
export const SESSION_COOKIE = "session";
