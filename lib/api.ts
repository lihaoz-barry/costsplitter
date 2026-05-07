import type { ParsedTx, Payer } from "./types";

// Browser-side wrapper around our /api/parse server route.
// All OpenAI calls happen on the server so the API key never reaches the client.
export async function parseStatement(
  text: string,
  source: string,
  payer: Payer,
): Promise<ParsedTx[]> {
  const res = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source, payer }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`parse ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.items as ParsedTx[]) || [];
}
