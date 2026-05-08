import type { ParsedTx, Payer } from "./types";
import { MODEL_ID } from "./constants";

export const SYSTEM_PROMPT = `You parse credit-card or bank statements into structured transactions.
Return ONLY valid JSON with this shape:
{ "items": [
  { "merchant": string, "amount": number (positive USD),
    "date": "MMM DD" (e.g. "Apr 03"),
    "cat": one of [groceries, auto, personal, utilities, dining, fitness, transit, home, subs, entertainment, health, travel, shopping, coffee, other],
    "conf": number 0..1 (your confidence in the parse) }
] }
Skip payments, refunds, fees, interest, and balance/total lines. Only real purchases. Amounts must be positive.`;

export const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
export const MAX_TEXT_CHARS = 60_000;

export interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export function buildRequestBody(text: string, source: string, payer: Payer) {
  return {
    model: MODEL_ID,
    messages: [
      { role: "system" as const, content: SYSTEM_PROMPT },
      {
        role: "user" as const,
        content:
          `Source: ${source}\n` +
          `Payer: ${payer}\n\n` +
          `Statement text:\n"""\n${text.slice(0, MAX_TEXT_CHARS)}\n"""\n\n` +
          `Return JSON only.`,
      },
    ],
    response_format: { type: "json_object" as const },
  };
}

export function extractItems(response: OpenAIChatResponse): ParsedTx[] {
  const content = response.choices?.[0]?.message?.content;
  if (!content) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];
  const items = (parsed as { items?: unknown }).items;
  return Array.isArray(items) ? (items as ParsedTx[]) : [];
}

export class MissingApiKeyError extends Error {
  constructor() {
    super("OpenAI API key not set — open Settings to add one");
    this.name = "MissingApiKeyError";
  }
}

export async function parseStatement(
  text: string,
  source: string,
  payer: Payer,
  apiKey: string,
): Promise<ParsedTx[]> {
  if (!apiKey) throw new MissingApiKeyError();

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildRequestBody(text, source, payer)),
  });

  if (!res.ok) {
    // Read once as text — Response bodies can only be consumed once, so doing
    // res.json() then falling back to res.text() throws on the second read.
    const raw = await res.text().catch(() => "");
    let detail = "";
    try {
      const data = JSON.parse(raw) as OpenAIChatResponse;
      detail = data.error?.message ?? raw.slice(0, 200);
    } catch {
      detail = raw.slice(0, 200);
    }
    throw new Error(`openai ${res.status}${detail ? `: ${detail}` : ""}`);
  }

  const data = (await res.json()) as OpenAIChatResponse;
  return extractItems(data);
}
