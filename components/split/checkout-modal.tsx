"use client";

import { computeShares, fmt } from "@/lib/format";
import type { Item, Names } from "@/lib/types";
import { useToast } from "../toast";

interface Props {
  items: Item[];
  names: Names;
  onClose: () => void;
}

export default function CheckoutModal({ items, names, onClose }: Props) {
  const toast = useToast();
  const { A, B } = computeShares(items);
  const diff = A - B;
  const settle = Math.abs(diff) / 2;
  const owes =
    diff > 0 ? `${names.B} → ${names.A}`
    : diff < 0 ? `${names.A} → ${names.B}`
    : "all even";
  const total = A + B;

  const buildReceipt = () => {
    const lines = [
      "CostSplitter — receipt",
      `Date: ${new Date().toLocaleDateString()}`,
      `${names.A}: ${fmt(A)}`,
      `${names.B}: ${fmt(B)}`,
      `Total spend: ${fmt(total)}`,
      "",
      diff === 0 ? "All even — nothing to settle." : `${owes}: ${fmt(settle)}`,
      "",
      `Items (${items.length}):`,
      ...items.map((it) => {
        const tag =
          it.bucket === "A" ? names.A
          : it.bucket === "B" ? names.B
          : `Shared ${it.splitPct ?? 50}/${100 - (it.splitPct ?? 50)}`;
        return `  ${it.date}  ${it.merchant.padEnd(28).slice(0, 28)}  ${fmt(it.amount).padStart(9)}  [${tag}]`;
      }),
    ];
    return lines.join("\n");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildReceipt());
      toast("Receipt copied to clipboard");
    } catch {
      toast("Copy failed — select text manually");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <h2>Checkout</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
          <div className="sk-box" style={{ padding: 10 }}>
            <span className="label-tag">{names.A}</span>
            <div className="hand" style={{ fontSize: 28, color: "var(--accent)", lineHeight: 1, marginTop: 4 }}>
              {fmt(A)}
            </div>
          </div>
          <div className="sk-box" style={{ padding: 10 }}>
            <span className="label-tag">{names.B}</span>
            <div className="hand" style={{ fontSize: 28, color: "var(--accent-2)", lineHeight: 1, marginTop: 4 }}>
              {fmt(B)}
            </div>
          </div>
        </div>
        <hr style={{ border: 0, borderTop: "1.5px dashed var(--ink-3)", margin: "14px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="hand" style={{ fontSize: 24 }}>{owes}</span>
          <span className="mono" style={{ fontSize: 22, fontWeight: 600 }}>{fmt(settle)}</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
          total spend {fmt(total)} · {items.length} items
        </div>
        <pre
          className="mono"
          style={{
            fontSize: 10, background: "var(--paper-2)", border: "1px solid var(--line)",
            padding: 10, marginTop: 14, borderRadius: 5, maxHeight: 180, overflow: "auto", whiteSpace: "pre",
          }}
        >
{buildReceipt()}
        </pre>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={copy}>📋 Copy receipt</button>
        </div>
      </div>
    </div>
  );
}
