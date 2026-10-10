import { readLlmConfig } from "../lib/ai-blog/config";
import { llm } from "../lib/ai-blog/llm";

function shapeOf(value: unknown, depth = 0): unknown {
  if (Array.isArray(value)) return value.length ? [shapeOf(value[0], depth + 1)] : [];
  if (value && typeof value === "object") {
    if (depth > 3) return "{…}";
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, shapeOf(inner, depth + 1)]),
    );
  }
  return typeof value;
}

async function main() {
  const config = readLlmConfig();
  if (!config) {
    console.error("EXPLABS_API_KEY is not set. Put it in apps/web/.env and re-run.");
    process.exit(1);
  }

  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Model:    ${config.model}\n`);

  const raw = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: 'Reply with exactly the word "pong".' }],
      max_tokens: 20,
    }),
  });
  const rawText = await raw.text();
  console.log(`Raw HTTP status: ${raw.status}`);
  try {
    const body = JSON.parse(rawText);
    console.log("Raw response shape:");
    console.log(JSON.stringify(shapeOf(body), null, 2));
  } catch {
    console.log(`Non-JSON body: ${rawText.slice(0, 300)}`);
  }

  console.log("\nThrough llm.complete (text):");
  const text = await llm.complete({
    system: "You are a terse assistant.",
    prompt: 'Reply with exactly the word "pong".',
    maxTokens: 20,
  });
  console.log(JSON.stringify(text, null, 2));

  console.log("\nThrough llm.complete (json mode):");
  const json = await llm.complete({
    system: "You output only JSON.",
    prompt: 'Return {"ok": true, "word": "pong"}.',
    json: true,
    maxTokens: 50,
  });
  console.log(JSON.stringify(json, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
