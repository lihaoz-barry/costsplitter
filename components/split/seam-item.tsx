"use client";

import { useRef } from "react";
import { CAT_GLYPH } from "@/lib/constants";
import { fmt } from "@/lib/format";
import type { Item } from "@/lib/types";

interface Props {
  it: Item;
  A: string;
  B: string;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<Item>) => void;
}

export default function SeamItem({
  it, A, B, dragging, onDragStart, onDragEnd, onDelete, onChange,
}: Props) {
  const pct = it.splitPct ?? 50;
  const barRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const move = (ev: MouseEvent) => {
      const rect = barRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
      const newPct = Math.round((x / rect.width) * 100);
      onChange({ splitPct: Math.max(0, Math.min(100, newPct)) });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
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
        <span className="hand" style={{ fontSize: 16, flex: 1 }}>{it.merchant}</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{fmt(it.amount)}</span>
        <button
          onClick={onDelete}
          style={{
            background: "none", border: 0, cursor: "pointer",
            color: "var(--ink-3)", fontSize: 12, padding: "0 2px",
          }}
        >✕</button>
      </div>
      <div className="seam-bar" ref={barRef}>
        <div className="left" style={{ width: pct + "%" }}>
          {pct > 14 && <span className="pct-label">{pct}%</span>}
        </div>
        <div className="right" style={{ width: 100 - pct + "%" }}>
          {100 - pct > 14 && <span className="pct-label">{100 - pct}%</span>}
        </div>
        <div className="handle" style={{ left: pct + "%" }} onMouseDown={onMouseDown} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
          {A}: {fmt(it.amount * pct / 100)}
        </span>
        <button
          onClick={() => onChange({ splitPct: 50 })}
          style={{
            background: "none", border: 0, cursor: "pointer",
            fontSize: 10, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace",
          }}
        >↺ 50/50</button>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
          {fmt(it.amount * (100 - pct) / 100)} :{B}
        </span>
      </div>
    </div>
  );
}
