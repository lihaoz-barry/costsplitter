import { describe, it, expect } from "vitest";
import { fmt, sumBucket, computeShares, suggestBucket } from "@/lib/format";
import type { Item } from "@/lib/types";

const item = (overrides: Partial<Item> = {}): Item => ({
  id: "x",
  merchant: "X",
  amount: 0,
  date: "Jan 01",
  cat: "other",
  conf: 1,
  source: "src",
  payer: "A",
  bucket: "inbox",
  splitPct: 50,
  ...overrides,
});

describe("fmt", () => {
  it("formats whole numbers with two decimals", () => {
    expect(fmt(10)).toBe("$10.00");
  });

  it("rounds to 2 decimal places", () => {
    expect(fmt(10.005)).toBe("$10.01");
    expect(fmt(10.004)).toBe("$10.00");
  });
});

describe("sumBucket", () => {
  it("sums only items in the matching bucket", () => {
    const items = [
      item({ amount: 5, bucket: "A" }),
      item({ amount: 3, bucket: "B" }),
      item({ amount: 2, bucket: "A" }),
    ];
    expect(sumBucket(items, "A")).toBe(7);
    expect(sumBucket(items, "B")).toBe(3);
    expect(sumBucket(items, "S")).toBe(0);
  });
});

describe("computeShares", () => {
  it("assigns A-bucket items entirely to A", () => {
    expect(computeShares([item({ amount: 10, bucket: "A" })])).toEqual({ A: 10, B: 0 });
  });

  it("assigns B-bucket items entirely to B", () => {
    expect(computeShares([item({ amount: 7, bucket: "B" })])).toEqual({ A: 0, B: 7 });
  });

  it("splits S-bucket items by splitPct", () => {
    const { A, B } = computeShares([item({ amount: 100, bucket: "S", splitPct: 70 })]);
    expect(A).toBeCloseTo(70, 10);
    expect(B).toBeCloseTo(30, 10);
  });

  it("defaults S items to 50/50 when splitPct is missing", () => {
    const it = item({ amount: 100, bucket: "S" });
    // simulate a malformed/legacy item with no splitPct
    delete (it as Partial<Item>).splitPct;
    expect(computeShares([it])).toEqual({ A: 50, B: 50 });
  });

  it("ignores inbox items", () => {
    expect(computeShares([item({ amount: 99, bucket: "inbox" })])).toEqual({ A: 0, B: 0 });
  });
});

describe("suggestBucket", () => {
  it("returns S for shared-merchant hints regardless of payer", () => {
    expect(suggestBucket({ merchant: "Costco gas" }, "A")).toBe("S");
    expect(suggestBucket({ merchant: "trader joe's" }, "B")).toBe("S");
  });

  it("returns S for shared categories (groceries/utilities/home/dining)", () => {
    expect(suggestBucket({ merchant: "random", cat: "groceries" }, "A")).toBe("S");
    expect(suggestBucket({ merchant: "random", cat: "utilities" }, "B")).toBe("S");
  });

  it("falls back to payer for non-shared items", () => {
    expect(suggestBucket({ merchant: "Spotify", cat: "subs" }, "A")).toBe("A");
    expect(suggestBucket({ merchant: "Spotify", cat: "subs" }, "B")).toBe("B");
  });

  it("returns inbox when payer is S (shared statement) and no shared hint matches", () => {
    expect(suggestBucket({ merchant: "Spotify", cat: "subs" }, "S")).toBe("inbox");
  });
});
