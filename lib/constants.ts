// Category glyphs used on item pills.
export const CAT_GLYPH: Record<string, string> = {
  groceries: "🛒", auto: "⛽", personal: "•", utilities: "⚡",
  dining: "🍱", fitness: "🏋", transit: "🚕", home: "🔧",
  subs: "♪", entertainment: "🎬", health: "⚕", travel: "✈",
  shopping: "🛍", coffee: "☕", other: "•",
};

// Handwritten fonts the user can pick in Settings. All are loaded once via the
// Google Fonts <link> in app/layout.tsx; switching just rewrites a CSS variable.
export const FONTS = [
  { id: "Caveat", label: "Caveat (default)" },
  { id: "Kalam", label: "Kalam" },
  { id: "Architects Daughter", label: "Architects Daughter" },
  { id: "Patrick Hand", label: "Patrick Hand" },
  { id: "Indie Flower", label: "Indie Flower" },
  { id: "Shadows Into Light", label: "Shadows Into Light" },
  { id: "Gochi Hand", label: "Gochi Hand" },
  { id: "Homemade Apple", label: "Homemade Apple" },
] as const;

export const DEFAULT_SETTINGS = { font: "Caveat", apiKey: "" };

// The OpenAI model used for PDF parsing. One-line swap to change models.
// If your account doesn't have gpt-5 access, switch to "gpt-4.1" or "gpt-4o".
export const MODEL_ID = "gpt-5";

export const STORAGE_KEY = "cs.store";

let _id = 0;
export const newId = () => `it_${Date.now()}_${++_id}`;
