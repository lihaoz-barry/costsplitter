"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type ToastFn = (message: string, ms?: number) => void;
const ToastCtx = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback<ToastFn>((m, ms = 2400) => {
    setMsg(m);
    setTimeout(() => setMsg(null), ms);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast">{msg}</div>}
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
