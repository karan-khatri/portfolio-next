export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ensureSeedData } = await import("@portfolio/db/server");
  try {
    await ensureSeedData();
  } catch (error) {
    console.error(error);
  }
}
