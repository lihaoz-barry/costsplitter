"use client";

import { Fragment, ReactNode, useRef, useState } from "react";
import type { Bucket, Item } from "@/lib/types";

interface Props {
  bucket: Bucket;
  header: ReactNode;
  sub: string;
  variant: "side" | "mid";
  items: Item[];
  renderItem: (it: Item, i: number) => ReactNode;
  onDropAt: (id: string, bucket: Bucket, index: number) => void;
}

export default function DropColumn({
  bucket, header, sub, variant, items, renderItem, onDropAt,
}: Props) {
  const [overState, setOverState] = useState<{ index: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const computeIndex = (e: React.DragEvent) => {
    const cont = containerRef.current;
    if (!cont) return items.length;
    const cards = [...cont.querySelectorAll("[data-item-card]")];
    if (!cards.length) return 0;
    const y = e.clientY;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) return i;
    }
    return cards.length;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="col-header">
        {header}
        <span className="sub">{sub}</span>
      </div>
      <div
        ref={containerRef}
        className={"col-drop col-" + variant + (overState ? " over" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          const idx = computeIndex(e);
          if (!overState || overState.index !== idx) setOverState({ index: idx });
        }}
        onDragLeave={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setOverState(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          const idx = computeIndex(e);
          setOverState(null);
          if (id) onDropAt(id, bucket, idx);
        }}
      >
        {items.length === 0 && !overState && (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "center", padding: 14 }}>
            drop items here
          </div>
        )}
        {items.map((it, i) => (
          <Fragment key={it.id}>
            {overState?.index === i && <div className="insert-line" />}
            <div data-item-card>{renderItem(it, i)}</div>
          </Fragment>
        ))}
        {overState?.index === items.length && <div className="insert-line" />}
      </div>
    </div>
  );
}
