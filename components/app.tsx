"use client";

import { useEffect, useState } from "react";
import { useStore, applyFont } from "@/lib/store";
import Topbar from "./topbar";
import SettingsModal from "./settings-modal";
import NamesModal from "./names-modal";
import UploadScreen from "./upload/upload-screen";
import SplitScreen from "./split/split-screen";
import { ToastProvider } from "./toast";

function Inner() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [editingNames, setEditingNames] = useState(false);

  const items = useStore((s) => s.items);
  const reset = useStore((s) => s.reset);
  const settings = useStore((s) => s.settings);

  // Avoid SSR/CSR mismatch — Zustand `persist` rehydrates on the client only.
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { applyFont(settings.font); }, [settings.font]);

  const handleReset = () => {
    if (confirm("Clear all parsed items and start over?")) {
      reset();
      setStep(0);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Topbar
        step={step}
        itemsCount={items.length}
        onStep={setStep}
        onOpenSettings={() => setShowSettings(true)}
        onEditNames={() => setEditingNames(true)}
        onReset={handleReset}
      />
      {step === 0 && <UploadScreen onAdvance={() => setStep(1)} />}
      {step === 1 && <SplitScreen />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {editingNames && <NamesModal onClose={() => setEditingNames(false)} />}
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}
