import { describe, it, expect, vi, afterEach } from "vitest";
import {
  buildRequestBody,
  extractItems,
  parseStatement,
  MissingApiKeyError,
  OPENAI_CHAT_URL,
  MAX_TEXT_CHARS,
} from "@/lib/api";
import { MODEL_ID } from "@/lib/constants";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildRequestBody", () => {
  it("includes model, system + user message, and json_object response_format", () => {
    const body = buildRequestBody("hello world", "card.pdf", "A");
    expect(body.model).toBe(MODEL_ID);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
    expect(body.messages[1].content).toContain("Source: card.pdf");
    expect(body.messages[1].content).toContain("Payer: A");
    expect(body.messages[1].content).toContain("hello world");
  });

  it(`truncates statement text to MAX_TEXT_CHARS (${MAX_TEXT_CHARS})`, () => {
    // Use a token that won't appear in surrounding template text.
    const token = "Z";
    const huge = token.repeat(MAX_TEXT_CHARS + 1000);
    const body = buildRequestBody(huge, "src", "B");
    const userMsg = body.messages[1].content;
    const tokens = (userMsg.match(/Z/g) ?? []).length;
    expect(tokens).toBe(MAX_TEXT_CHARS);
  });
});

describe("extractItems", () => {
  it("returns items array from valid JSON content", () => {
    const items = extractItems({
      choices: [{ message: { content: '{"items":[{"merchant":"X","amount":1.5}]}' } }],
    });
    expect(items).toEqual([{ merchant: "X", amount: 1.5 }]);
  });

  it("returns [] when content is missing", () => {
    expect(extractItems({})).toEqual([]);
    expect(extractItems({ choices: [] })).toEqual([]);
    expect(extractItems({ choices: [{}] })).toEqual([]);
  });

  it("returns [] when content is invalid JSON", () => {
    expect(extractItems({ choices: [{ message: { content: "not json" } }] })).toEqual([]);
  });

  it("returns [] when JSON has no items array", () => {
    expect(extractItems({ choices: [{ message: { content: "{}" } }] })).toEqual([]);
    expect(
      extractItems({ choices: [{ message: { content: '{"items":"oops"}' } }] }),
    ).toEqual([]);
  });
});

describe("parseStatement", () => {
  it("throws MissingApiKeyError when key is empty", async () => {
    await expect(parseStatement("text", "src", "A", "")).rejects.toBeInstanceOf(
      MissingApiKeyError,
    );
  });

  it("posts to OpenAI with bearer auth and returns parsed items", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            { message: { content: '{"items":[{"merchant":"Coffee","amount":4}]}' } },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const items = await parseStatement("statement text", "src", "A", "sk-test");

    expect(items).toEqual([{ merchant: "Coffee", amount: 4 }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(OPENAI_CHAT_URL);
    expect(init.method).toBe("POST");
    expect(init.headers["Authorization"]).toBe("Bearer sk-test");
    expect(init.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe(MODEL_ID);
  });

  it("throws an error containing the OpenAI error message on non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: "Incorrect API key provided" } }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(parseStatement("text", "src", "A", "sk-bad")).rejects.toThrow(
      /openai 401.*Incorrect API key/,
    );
  });

  it("falls back to plain text when error response is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("upstream timed out", { status: 504 }),
      ),
    );

    await expect(parseStatement("text", "src", "A", "sk-x")).rejects.toThrow(
      /openai 504.*upstream timed out/,
    );
  });
});
