"use client";

import { useEffect, useState } from "react";
import { useStore, applyFont } from "@/lib/store";
import { FONTS } from "@/lib/constants";
import { useToast } from "./toast";

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const toast = useToast();
  const [font, setFont] = useState(settings.font);

  // Live preview
  useEffect(() => { applyFont(font); }, [font]);

  const save = () => {
    setSettings({ font });
    applyFont(font);
    toast("Settings saved");
    onClose();
  };

  const cancel = () => {
    applyFont(settings.font);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={cancel}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <p style={{ marginTop: 0, fontSize: 13, color: "var(--ink-2)" }}>
          The OpenAI API key is configured server-side via the{" "}
          <span className="mono" style={{ fontSize: 12 }}>OPENAI_API_KEY</span>{" "}
          environment variable. Font choice is stored in your browser only.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          <div>
            <div className="label-tag" style={{ marginBottom: 4 }}>Display font</div>
            <select
              className="select"
              value={font}
              onChange={(e) => setFont(e.target.value)}
              style={{ fontFamily: `"${font}", cursive` }}
            >
              {FONTS.map((f) => (
                <option key={f.id} value={f.id} style={{ fontFamily: `"${f.id}", cursive` }}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="hand" style={{ fontSize: 26, marginTop: 6, color: "var(--accent)" }}>
              The quick brown fox $1,234.56
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn ghost" onClick={cancel}>Cancel</button>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
