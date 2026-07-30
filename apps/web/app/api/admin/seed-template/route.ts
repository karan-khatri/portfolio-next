import { exportSeedPayload } from "@portfolio/db/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await exportSeedPayload();
  const body = JSON.stringify(payload, null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="seed-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
