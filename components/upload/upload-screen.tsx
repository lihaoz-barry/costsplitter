"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "../toast";
import { extractPdfText } from "@/lib/pdf";
import { parseStatement } from "@/lib/api";
import { suggestBucket } from "@/lib/format";
import { newId } from "@/lib/constants";
import type { FileEntry, Item, Payer } from "@/lib/types";
import FileDropZone from "./file-drop-zone";
import QueuePanel from "./queue-panel";

interface Props {
  onAdvance: () => void;
}

export default function UploadScreen({ onAdvance }: Props) {
  const names = useStore((s) => s.names);
  const addItems = useStore((s) => s.addItems);
  const toast = useToast();

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const addFiles = (payer: Payer) => (newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map<FileEntry>((file) => ({
        id: newId(), name: file.name, size: file.size, file, payer, status: "queued",
      })),
    ]);
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const updateFile = (id: string, patch: Partial<FileEntry>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const analyze = async () => {
    if (!files.length) {
      toast("Add at least one PDF first");
      return;
    }
    setAnalyzing(true);
    let totalAdded = 0;

    for (const f of files) {
      if (f.status === "done") continue;
      updateFile(f.id, { status: "parsing" });
      try {
        const text = await extractPdfText(f.file);
        if (!text || text.length < 20) throw new Error("empty PDF text");
        const parsed = await parseStatement(text, f.name, f.payer);
        const items: Item[] = parsed
          .map((it) => ({
            id: newId(),
            merchant: it.merchant || "Unknown",
            amount: Math.abs(Number(it.amount) || 0),
            date: it.date || "—",
            cat: it.cat || "other",
            conf: typeof it.conf === "number" ? it.conf : 0.8,
            source: f.name,
            payer: f.payer,
            bucket: suggestBucket(it, f.payer),
            splitPct: 50,
          }))
          .filter((i) => i.amount > 0);
        addItems(items);
        totalAdded += items.length;
        updateFile(f.id, { status: "done", count: items.length });
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : "failed";
        updateFile(f.id, { status: "error", error: message.slice(0, 60) });
      }
    }

    setAnalyzing(false);
    if (totalAdded > 0) {
      toast(`Parsed ${totalAdded} items`);
      setTimeout(() => onAdvance(), 600);
    } else {
      toast("No items parsed — check your statements");
    }
  };

  const aFiles = files.filter((f) => f.payer === "A");
  const bFiles = files.filter((f) => f.payer === "B");
  const sFiles = files.filter((f) => f.payer === "S");
  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div style={{
      padding: 22,
      display: "grid",
      gridTemplateColumns: "1fr 380px",
      gap: 18,
      maxWidth: 1280,
      margin: "0 auto",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="hand" style={{ fontSize: 32, lineHeight: 1 }}>
            Drop your statements
          </div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
            PDF only · Each PDF is parsed by your server&apos;s OpenAI key
          </div>
        </div>
        <FileDropZone
          label={names.A} color="var(--accent)"
          files={aFiles} onFilesAdded={addFiles("A")} onRemove={removeFile}
        />
        <FileDropZone
          label={names.B} color="var(--accent-2)"
          files={bFiles} onFilesAdded={addFiles("B")} onRemove={removeFile}
        />
        <FileDropZone
          label="Shared / household" color="var(--shared)"
          files={sFiles} onFilesAdded={addFiles("S")} onRemove={removeFile}
        />
      </div>

      <QueuePanel
        files={files}
        analyzing={analyzing}
        allDone={allDone}
        onAnalyze={analyze}
        onAdvance={onAdvance}
      />
    </div>
  );
}
