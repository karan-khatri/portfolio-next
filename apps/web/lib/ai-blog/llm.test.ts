import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { llm, LlmError } from "./llm";

const realFetch = globalThis.fetch;

const okBody = {
  model: "m",
  choices: [{ message: { content: '{"ok":true}' }, finish_reason: "stop" }],
  usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("llm.complete", () => {
  let sent: Record<string, unknown>[] = [];

  beforeEach(() => {
    sent = [];
    process.env.EXPLABS_API_KEY = "test-key";
    process.env.EXPLABS_BASE_URL = "http://llm.test/v1";
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  function mock(handler: (body: Record<string, unknown>, call: number) => Response) {
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      sent.push(body);
      return handler(body, sent.length);
    }) as typeof fetch;
  }

  it("does not send temperature unless asked to", async () => {
    mock(() => jsonResponse(okBody));
    const result = await llm.complete({ system: "s", prompt: "p", json: true });
    assert.equal("temperature" in sent[0], false);
    assert.deepEqual(sent[0].response_format, { type: "json_object" });
    assert.equal(result.text, '{"ok":true}');
    assert.deepEqual(result.usage, { promptTokens: 10, completionTokens: 5, totalTokens: 15 });
  });

  it("drops temperature and retries when the model route rejects it", async () => {
    mock((body) =>
      "temperature" in body
        ? jsonResponse(
            { error: { message: "The value 0.4 for 'temperature' is not supported by this model route." } },
            400,
          )
        : jsonResponse(okBody),
    );
    const result = await llm.complete({ system: "s", prompt: "p", temperature: 0.4 });
    assert.equal(sent.length, 2);
    assert.equal("temperature" in sent[1], false);
    assert.equal(result.text, '{"ok":true}');
  });

  it("falls back to max_completion_tokens when max_tokens is rejected", async () => {
    mock((body) =>
      "max_tokens" in body
        ? jsonResponse({ error: { message: "Unsupported parameter: 'max_tokens'. Use 'max_completion_tokens'." } }, 400)
        : jsonResponse(okBody),
    );
    await llm.complete({ system: "s", prompt: "p", maxTokens: 123 });
    assert.equal(sent[1].max_completion_tokens, 123);
    assert.equal("max_tokens" in sent[1], false);
  });

  it("retries without response_format when JSON mode is rejected", async () => {
    mock((body) =>
      body.response_format
        ? jsonResponse({ error: { message: "response_format is not supported" } }, 400)
        : jsonResponse(okBody),
    );
    await llm.complete({ system: "s", prompt: "p", json: true });
    assert.equal("response_format" in sent[1], false);
  });

  it("surfaces unrelated 400 errors without looping", async () => {
    mock(() => jsonResponse({ error: { message: "messages must not be empty" } }, 400));
    await assert.rejects(
      () => llm.complete({ system: "s", prompt: "p" }),
      (error: unknown) => error instanceof LlmError && error.status === 400 && /messages must not be empty/.test(error.message),
    );
    assert.equal(sent.length, 1);
  });

  it("retries 429 and 5xx responses with backoff, then succeeds", async () => {
    mock((_body, call) => (call < 3 ? jsonResponse({ error: { message: "busy" } }, call === 1 ? 429 : 503) : jsonResponse(okBody)));
    const result = await llm.complete({ system: "s", prompt: "p" });
    assert.equal(sent.length, 3);
    assert.equal(result.text, '{"ok":true}');
  });

  it("does not retry authentication failures", async () => {
    mock(() => jsonResponse({ error: { message: "bad key" } }, 401));
    await assert.rejects(() => llm.complete({ system: "s", prompt: "p" }), /authentication failed/);
    assert.equal(sent.length, 1);
  });
});
