export type Bucket = "A" | "B" | "S" | "inbox";
export type Payer = "A" | "B" | "S";

export type Category =
  | "groceries" | "auto" | "personal" | "utilities"
  | "dining" | "fitness" | "transit" | "home"
  | "subs" | "entertainment" | "health" | "travel"
  | "shopping" | "coffee" | "other";

export interface Item {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  cat: Category;
  conf: number;
  source: string;
  payer: Payer;
  bucket: Bucket;
  splitPct: number;
}

export interface Names { A: string; B: string }
export interface Settings { font: string }

export interface ParsedTx {
  merchant: string;
  amount: number;
  date: string;
  cat: Category;
  conf: number;
}

export interface FileEntry {
  id: string;
  name: string;
  size: number;
  file: File;
  payer: Payer;
  status: "queued" | "parsing" | "done" | "error";
  count?: number;
  error?: string;
}
