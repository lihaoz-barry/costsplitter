"use client";

import type { FileEntry } from "@/lib/types";
import { MODEL_ID } from "@/lib/constants";
import { useStore } from "@/lib/store";

interface Props {
  files: FileEntry[];
  analyzing: boolean;
  allDone: boolean;
  onAnalyze: () => void;
  onAdvance: () => void;
}

export default function QueuePanel({
  files, analyzing, allDone, onAnalyze, onAdvance,
}: Props) {
  const apiKey = useStore((s) => s.settings.apiKey);
  const keyConfigured = !!apiKey;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="post-it">
        1) Drop a PDF in each person&apos;s box. 2) Click <b>Analyze with AI</b> —
        items get auto-bucketed; you tweak on the next screen.
      </div>

      <div className="sk-box" style={{ padding: 14 }}>
        <div className="label-tag">OpenAI</div>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
          🧠 model: <b style={{ color: "var(--ink)" }}>{MODEL_ID}</b>
        </div>
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: keyConfigured ? "var(--ink-3)" : "var(--danger)",
            marginTop: 4,
          }}
        >
          {keyConfigured
            ? "🔑 API key set in browser — calls go directly to OpenAI"
            : "⚠ no API key — open Settings to add one"}
        </div>
      </div>

      <div className="sk-box" style={{ padding: 14, flex: 1 }}>
        <div className="label-tag">Queue</div>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {files.length === 0 ? (
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              nothing yet
            </div>
          ) : (
            files.map((f) => (
              <div
                key={f.id}
                className="mono"
                style={{ fontSize: 11, display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {f.payer === "A" ? "🟠" : f.payer === "B" ? "🔵" : "🟡"} {f.name}
                </span>
                <span
                  style={{
                    color:
                      f.status === "error" ? "var(--danger)"
                      : f.status === "done" ? "var(--ok)"
                      : "var(--ink-3)",
                  }}
                >
                  {f.status === "queued" && "○"}
                  {f.status === "parsing" && "◐"}
                  {f.status === "done" && `✓ ${f.count}`}
                  {f.status === "error" && "✗"}
                </span>
              </div>
            ))
          )}
        </div>
        <hr style={{ border: 0, borderTop: "1.5px dashed var(--ink-3)", margin: "12px 0" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {allDone && (
            <button className="btn" onClick={onAdvance}>Skip to split →</button>
          )}
          <button
            className="btn primary"
            disabled={analyzing || files.length === 0}
            onClick={onAnalyze}
          >
            {analyzing ? <><span className="spinner" /> analyzing…</> : "Analyze with AI →"}
          </button>
        </div>
      </div>
    </div>
  );
}
