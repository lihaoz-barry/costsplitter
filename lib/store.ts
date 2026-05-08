"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Item, Names, Settings } from "./types";
import { DEFAULT_SETTINGS, STORAGE_KEY } from "./constants";

interface Store {
  items: Item[];
  names: Names;
  settings: Settings;
  setItems: (updater: Item[] | ((prev: Item[]) => Item[])) => void;
  addItems: (items: Item[]) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  setNames: (names: Names) => void;
  setSettings: (settings: Settings) => void;
  reset: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      items: [],
      names: { A: "Boyfriend", B: "Girlfriend" },
      settings: DEFAULT_SETTINGS,
      setItems: (updater) =>
        set((s) => ({
          items: typeof updater === "function" ? updater(s.items) : updater,
        })),
      addItems: (newItems) => set((s) => ({ items: [...s.items, ...newItems] })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),
      deleteItem: (id) =>
        set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      setNames: (names) => set({ names }),
      setSettings: (settings) => set({ settings }),
      reset: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Old persisted state may be missing newer Settings fields (e.g. apiKey).
      // Merge per-slice so defaults fill in any missing keys.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>;
        return {
          ...current,
          ...p,
          names: { ...current.names, ...(p.names ?? {}) },
          settings: { ...current.settings, ...(p.settings ?? {}) },
        };
      },
    },
  ),
);

// Apply a font family by rewriting the --font-hand CSS variable.
// All handwritten fonts are pre-loaded via the <link> in app/layout.tsx.
export function applyFont(family: string) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--font-hand", `"${family}", cursive`);
}
