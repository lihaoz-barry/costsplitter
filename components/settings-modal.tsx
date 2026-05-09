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
  const [apiKey, setApiKey] = useState(settings.apiKey ?? "");
  const [showKey, setShowKey] = useState(false);

  // Live preview
  useEffect(() => { applyFont(font); }, [font]);

  const save = () => {
    setSettings({ font, apiKey: apiKey.trim() });
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
          Your OpenAI API key and font choice are stored in this browser only
          (localStorage). The key is sent directly from your browser to the
          OpenAI API — it never touches a server we control.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          <div>
            <div className="label-tag" style={{ marginBottom: 4 }}>OpenAI API key</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type={showKey ? "text" : "password"}
                className="select mono"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                style={{ flex: 1, fontSize: 12 }}
              />
              <button
                type="button"
                className="btn ghost"
                onClick={() => setShowKey((v) => !v)}
                style={{ minWidth: 64 }}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
              Get one at platform.openai.com/api-keys.
            </div>
          </div>

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
