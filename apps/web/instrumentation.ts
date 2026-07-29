export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ensureSeedData } = await import("@portfolio/db/server");
  try {
    console.log("Ensuring seed data...");
    await ensureSeedData();
    console.log("Seed data ensured");
  } catch (error) {
    console.error(error);
  }
}
