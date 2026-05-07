"use client";

import { useRef, useState } from "react";
import type { FileEntry } from "@/lib/types";

interface Props {
  label: string;
  color: string;
  files: FileEntry[];
  onFilesAdded: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export default function FileDropZone({ label, color, files, onFilesAdded, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div className="sk-box" style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: color, border: "1.5px solid var(--line)" }} />
        <div className="hand" style={{ fontSize: 22, lineHeight: 1 }}>{label}</div>
        <div style={{ flex: 1 }} />
        <span className="pill">{files.length} file{files.length === 1 ? "" : "s"}</span>
      </div>
      <div
        className={"drop-zone" + (over ? " dragging" : "")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const fs = [...e.dataTransfer.files].filter(
            (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
          );
          if (fs.length) onFilesAdded(fs);
        }}
      >
        ⬇  drop PDF here
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>
          or click to browse
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={(e) => {
            const fs = e.target.files ? [...e.target.files] : [];
            if (fs.length) onFilesAdded(fs);
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {files.map((f) => (
            <div
              key={f.id}
              className="mono"
              style={{ fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                📄 {f.name}
                {f.status === "parsing" && (
                  <span style={{ marginLeft: 6, color: "var(--accent)" }}>
                    <span className="spinner" /> parsing…
                  </span>
                )}
                {f.status === "done" && (
                  <span style={{ marginLeft: 6, color: "var(--ok)" }}> ✓ {f.count} items</span>
                )}
                {f.status === "error" && (
                  <span style={{ marginLeft: 6, color: "var(--danger)" }}> ✗ {f.error}</span>
                )}
              </span>
              <span style={{ color: "var(--ink-3)", marginLeft: 8 }}>{(f.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={() => onRemove(f.id)}
                style={{ background: "none", border: 0, cursor: "pointer", color: "var(--ink-3)", padding: "0 4px" }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
