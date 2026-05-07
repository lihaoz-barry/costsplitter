"use client";

import { useState } from "react";
import { CAT_GLYPH } from "@/lib/constants";
import { fmt } from "@/lib/format";
import type { Item } from "@/lib/types";

interface Props {
  it: Item;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<Item>) => void;
}

export default function ItemPill({
  it, dragging, onDragStart, onDragEnd, onDelete, onChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(it.amount));

  const commit = () => {
    const n = parseFloat(val);
    if (isFinite(n) && n >= 0) onChange({ amount: Math.round(n * 100) / 100 });
    else setVal(String(it.amount));
    setEditing(false);
  };

  return (
    <div
      className={"item-card" + (dragging ? " dragging" : "")}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", it.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(it.id);
      }}
      onDragEnd={onDragEnd}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 12 }}>{CAT_GLYPH[it.cat] || "•"}</span>
        <span className="hand" style={{ fontSize: 16, lineHeight: 1.05, flex: 1 }}>{it.merchant}</span>
        {editing ? (
          <input
            className="mono"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setVal(String(it.amount)); setEditing(false); }
            }}
            style={{
              width: 70, fontSize: 13, padding: "1px 4px",
              border: "1px solid var(--line)", borderRadius: 3, background: "var(--paper-2)",
            }}
          />
        ) : (
          <span
            className="mono"
            style={{ fontSize: 13, fontWeight: 500, cursor: "text" }}
            onClick={() => setEditing(true)}
            title="click to edit"
          >
            {fmt(it.amount)}
          </span>
        )}
        <button
          onClick={onDelete}
          style={{
            background: "none", border: 0, cursor: "pointer",
            color: "var(--ink-3)", fontSize: 12, padding: "0 2px",
          }}
          title="remove"
        >✕</button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
          {it.date} · {it.cat}
        </span>
        {it.conf < 0.8 && (
          <span
            className="pill"
            style={{ borderColor: "var(--accent)", color: "var(--accent)", fontSize: 9, padding: "0 5px" }}
          >
            ⚠ {Math.round(it.conf * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}
