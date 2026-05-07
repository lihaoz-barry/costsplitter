"use client";

import { useStore } from "@/lib/store";

interface Props {
  step: number;
  itemsCount: number;
  onStep: (n: number) => void;
  onOpenSettings: () => void;
  onEditNames: () => void;
  onReset: () => void;
}

export default function Topbar({
  step, itemsCount, onStep, onOpenSettings, onEditNames, onReset,
}: Props) {
  const names = useStore((s) => s.names);
  return (
    <div className="topbar">
      <div className="brand">
        Cost<span className="accent">Splitter</span>
      </div>

      <div
        className="pill"
        style={{ marginLeft: 4, cursor: "pointer" }}
        onClick={onEditNames}
        title="rename"
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} /> {names.A}
        &nbsp;·&nbsp;
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-2)", display: "inline-block" }} /> {names.B}
        &nbsp;✎
      </div>

      <div style={{ flex: 1 }} />

      <div className="steps">
        <span className="step-pill" onClick={() => onStep(0)}>
          <span className={"step-num" + (step === 0 ? " active" : step > 0 ? " done" : "")}>1</span>
          <span style={{ opacity: step === 0 ? 1 : 0.6 }}>Upload</span>
        </span>
        <span className="step-line" />
        <span className="step-pill" onClick={() => itemsCount && onStep(1)}>
          <span className={"step-num" + (step === 1 ? " active" : "")}>2</span>
          <span style={{ opacity: step === 1 ? 1 : 0.6 }}>Split &amp; checkout</span>
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <button className="btn ghost" onClick={onOpenSettings} title="Settings">
        ⚙ settings
      </button>
      {itemsCount > 0 && (
        <button className="btn ghost" onClick={onReset} style={{ color: "var(--danger)" }}>
          reset
        </button>
      )}
    </div>
  );
}
