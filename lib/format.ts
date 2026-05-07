import type { Item, Payer, Bucket } from "./types";

export const fmt = (n: number) => "$" + (Math.round(n * 100) / 100).toFixed(2);

export function sumBucket(items: Item[], bucket: Bucket) {
  return items.filter((i) => i.bucket === bucket).reduce((a, b) => a + b.amount, 0);
}

export function computeShares(items: Item[]): { A: number; B: number } {
  let A = 0, B = 0;
  for (const it of items) {
    if (it.bucket === "A") A += it.amount;
    else if (it.bucket === "B") B += it.amount;
    else if (it.bucket === "S") {
      const pct = it.splitPct ?? 50;
      A += it.amount * (pct / 100);
      B += it.amount * (1 - pct / 100);
    }
  }
  return { A, B };
}

export function suggestBucket(item: { merchant?: string; cat?: string }, payer: Payer): Bucket {
  const m = (item.merchant || "").toLowerCase();
  const c = item.cat;
  const sharedCats = new Set(["groceries", "utilities", "home", "dining"]);
  const sharedHints = ["pg&e", "comcast", "internet", "rent", "costco", "trader joe", "whole foods", "safeway", "walmart"];
  if (sharedHints.some((h) => m.includes(h))) return "S";
  if (c && sharedCats.has(c)) return "S";
  if (payer === "A") return "A";
  if (payer === "B") return "B";
  return "inbox";
}

export const sumA = (items: Item[]) => items.reduce((a, b) => a + b.amount, 0);
