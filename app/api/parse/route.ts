import { NextResponse } from "next/server";
import OpenAI from "openai";
import { MODEL_ID } from "@/lib/constants";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You parse credit-card or bank statements into structured transactions.
Return ONLY valid JSON with this shape:
{ "items": [
  { "merchant": string, "amount": number (positive USD),
    "date": "MMM DD" (e.g. "Apr 03"),
    "cat": one of [groceries, auto, personal, utilities, dining, fitness, transit, home, subs, entertainment, health, travel, shopping, coffee, other],
    "conf": number 0..1 (your confidence in the parse) }
] }
Skip payments, refunds, fees, interest, and balance/total lines. Only real purchases. Amounts must be positive.`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not set on server" },
      { status: 500 },
    );
  }

  const { text, source, payer } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Source: ${source ?? "statement"}\n` +
            `Payer: ${payer ?? "unknown"}\n\n` +
            `Statement text:\n"""\n${text.slice(0, 60000)}\n"""\n\n` +
            `Return JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsed: { items?: unknown };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ items: [] });
    }
    return NextResponse.json({ items: parsed.items || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "openai call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
