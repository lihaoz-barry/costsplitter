"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

interface Props {
  onClose: () => void;
}

export default function NamesModal({ onClose }: Props) {
  const names = useStore((s) => s.names);
  const setNames = useStore((s) => s.setNames);
  const [draft, setDraft] = useState(names);

  const save = () => {
    setNames(draft);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <h2>Names</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          <label className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            Person A
            <input
              className="input"
              value={draft.A}
              onChange={(e) => setDraft({ ...draft, A: e.target.value })}
              style={{ marginTop: 4 }}
            />
          </label>
          <label className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            Person B
            <input
              className="input"
              value={draft.B}
              onChange={(e) => setDraft({ ...draft, B: e.target.value })}
              style={{ marginTop: 4 }}
            />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button className="btn primary" onClick={save}>Done</button>
        </div>
      </div>
    </div>
  );
}
