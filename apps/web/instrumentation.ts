export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ensureAdminAccount } = await import("@portfolio/db/server");
  try {
    await ensureAdminAccount();
  } catch (error) {
    console.error(error);
  }
}
