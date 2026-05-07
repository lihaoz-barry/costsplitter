"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { computeShares, fmt, sumA } from "@/lib/format";
import type { Bucket } from "@/lib/types";
import DropColumn from "./drop-column";
import ItemPill from "./item-pill";
import SeamItem from "./seam-item";
import CheckoutModal from "./checkout-modal";

export default function SplitScreen() {
  const items = useStore((s) => s.items);
  const setItems = useStore((s) => s.setItems);
  const updateItem = useStore((s) => s.updateItem);
  const deleteItem = useStore((s) => s.deleteItem);
  const names = useStore((s) => s.names);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Move an item to a bucket at a specific index. Same-bucket = reorder.
  const onDropAt = (id: string, bucket: Bucket, index: number) => {
    setItems((prev) => {
      const item = prev.find((x) => x.id === id);
      if (!item) return prev;
      const without = prev.filter((x) => x.id !== id);
      const updated = { ...item, bucket };
      const targets = without.filter((x) => x.bucket === bucket);
      const others = without.filter((x) => x.bucket !== bucket);
      const clamped = Math.max(0, Math.min(index, targets.length));
      targets.splice(clamped, 0, updated);
      return [...others, ...targets];
    });
  };

  const A = items.filter((i) => i.bucket === "A");
  const B = items.filter((i) => i.bucket === "B");
  const S = items.filter((i) => i.bucket === "S");
  const inbox = items.filter((i) => i.bucket === "inbox");

  const totals = computeShares(items);
  const diff = totals.A - totals.B;
  const settle = Math.abs(diff) / 2;
  const owes =
    diff > 0 ? `${names.B} → ${names.A}`
    : diff < 0 ? `${names.A} → ${names.B}`
    : "all even";

  return (
    <div style={{
      padding: 18, display: "flex", flexDirection: "column", gap: 12,
      height: "calc(100vh - 60px)", maxWidth: 1500, margin: "0 auto",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div className="hand" style={{ fontSize: 28, lineHeight: 1 }}>
          Drag · split · checkout
        </div>
        <span className="pill">{items.length} items</span>
        {inbox.length > 0 && (
          <span className="pill" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
            {inbox.length} unsorted
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
          drag to move · drag the bar in shared to set ratio · click amount to edit
        </span>
      </div>

      {inbox.length > 0 && (
        <div className="sk-box" style={{ padding: 10, background: "var(--paper-2)" }}>
          <div className="label-tag" style={{ marginBottom: 6 }}>
            Inbox · drag onto a column
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {inbox.map((it) => (
              <div key={it.id} style={{ minWidth: 200, flex: "0 0 auto" }}>
                <ItemPill
                  it={it}
                  dragging={draggingId === it.id}
                  onDragStart={setDraggingId}
                  onDragEnd={() => setDraggingId(null)}
                  onDelete={() => deleteItem(it.id)}
                  onChange={(patch) => updateItem(it.id, patch)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px 1fr", gap: 0, flex: 1, minHeight: 0 }}>
        <DropColumn
          bucket="A" variant="side"
          header={<><span className="dot" /> {names.A}</>}
          sub={`${fmt(sumA(A))} · ${A.length}`}
          items={A}
          onDropAt={onDropAt}
          renderItem={(it) => (
            <ItemPill
              it={it}
              dragging={draggingId === it.id}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDelete={() => deleteItem(it.id)}
              onChange={(patch) => updateItem(it.id, patch)}
            />
          )}
        />
        <DropColumn
          bucket="S" variant="mid"
          header={<><span className="dot s" /> Shared seam</>}
          sub={`${fmt(sumA(S))} · ${S.length}`}
          items={S}
          onDropAt={onDropAt}
          renderItem={(it) => (
            <SeamItem
              it={it} A={names.A} B={names.B}
              dragging={draggingId === it.id}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDelete={() => deleteItem(it.id)}
              onChange={(patch) => updateItem(it.id, patch)}
            />
          )}
        />
        <DropColumn
          bucket="B" variant="side"
          header={<><span className="dot b" /> {names.B}</>}
          sub={`${fmt(sumA(B))} · ${B.length}`}
          items={B}
          onDropAt={onDropAt}
          renderItem={(it) => (
            <ItemPill
              it={it}
              dragging={draggingId === it.id}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDelete={() => deleteItem(it.id)}
              onChange={(patch) => updateItem(it.id, patch)}
            />
          )}
        />
      </div>

      <div className="tally-bar">
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="dot" />
          <span className="hand" style={{ fontSize: 16 }}>{names.A}</span>
          <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--accent)" }}>
            {fmt(totals.A)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="dot b" />
          <span className="hand" style={{ fontSize: 16 }}>{names.B}</span>
          <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-2)" }}>
            {fmt(totals.B)}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="hand" style={{ fontSize: 20 }}>{owes}</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 600 }}>{fmt(settle)}</span>
        </div>
        <button
          className="btn primary"
          onClick={() => setShowCheckout(true)}
          disabled={items.length === 0}
        >
          Checkout →
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal items={items} names={names} onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
}
