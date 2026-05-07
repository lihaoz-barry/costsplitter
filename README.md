# CostSplitter (Next.js)

Drop two PDF statements, the app parses them with OpenAI, you drag items between
"Person A / Shared / Person B" buckets, and it tells you who owes whom.

This is the Next.js / TypeScript port of the original HTML/JSX prototype that
lives in `../project/`. The visual design is identical; the architecture is
decoupled so you can iterate, test, and deploy faster.

---

## 1. Run it locally — fastest path

You need **Node.js 18.18+** (Node 20 LTS recommended) and an **OpenAI API key**.

```bash
# 1. Install dependencies (one time, ~30s)
npm install

# 2. Configure your OpenAI key
cp .env.local.example .env.local
# then open .env.local and paste your real sk-... key

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>. Edits to `.tsx` / `.ts` / `.css` files hot-reload
automatically — no restart needed.

> **Stop the server**: press `Ctrl+C` in the terminal.
> **Restart**: re-run `npm run dev`. You only need to restart after changing
> `.env.local`, `next.config.ts`, or `package.json`.

---

## 2. All commands at a glance

| Command            | What it does                                                |
| ------------------ | ----------------------------------------------------------- |
| `npm install`      | Install dependencies. Run after `git pull` if deps changed. |
| `npm run dev`      | Dev server with hot reload at <http://localhost:3000>.      |
| `npm run typecheck`| Run TypeScript with no emit — catches type errors only.     |
| `npm run build`    | Production build into `.next/`. Catches build-time errors.  |
| `npm run start`    | Serve the production build locally (run `build` first).     |

Two-step "is this ready to ship?" check:

```bash
npm run typecheck && npm run build
```

If both pass, the app will deploy successfully on Vercel.

---

## 3. How to debug

### Browser-side bugs (UI, drag/drop, state)
1. Open the page in Chrome/Firefox.
2. Press **F12** → **Console** tab. Errors and `console.error(...)` from
   `upload-screen.tsx` show up here.
3. **Sources** tab → find your `.tsx` file → set breakpoints.
4. **Application** → **Local Storage** → `http://localhost:3000` → key `cs.store`.
   That's the entire persisted state. Delete it to reset to defaults.
5. **Network** tab → filter `parse` → inspect the request/response to
   `/api/parse`. If parsing fails, the response body has the error.

### Server-side bugs (the OpenAI call)
1. The dev server prints API route logs to the **terminal where you ran
   `npm run dev`**.
2. Add `console.log(...)` inside `app/api/parse/route.ts` — output appears in
   that terminal, not the browser console.
3. Common errors and what they mean:
   - `OPENAI_API_KEY not set on server` → fix `.env.local`, restart `npm run dev`.
   - `openai 401` → the key is invalid or revoked.
   - `openai 404 model not found` → your account doesn't have access to the
     model in `lib/constants.ts` → switch `MODEL_ID` to `"gpt-4.1"` or `"gpt-4o"`.
   - `empty PDF text` → the PDF is image-only (a scan). pdf.js can't read it.
     Use a text-based PDF.

### Type / lint errors
- `npm run typecheck` will list every TS error with the file and line number.
- VS Code with the built-in TypeScript server highlights errors as you type —
  no extra setup needed.

### "Hydration mismatch" warning in the console
This is intentionally suppressed by the `mounted` gate in `components/app.tsx`.
If you re-introduce one, it usually means a component is reading from the
Zustand store before the persisted state has been rehydrated.

---

## 4. Project structure

```
costspliter-next/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # <html>, fonts, metadata — wraps every page
│   ├── page.tsx                  # the home route — renders <App />
│   ├── globals.css               # all styling (verbatim from prototype)
│   └── api/parse/route.ts        # POST /api/parse — server-side OpenAI call
│
├── components/                   # All React UI
│   ├── app.tsx                   # top-level: stepper + which screen to show
│   ├── topbar.tsx                # brand, names pill, step nav, settings/reset
│   ├── settings-modal.tsx        # font picker
│   ├── names-modal.tsx           # rename Person A / Person B
│   ├── toast.tsx                 # <ToastProvider> + useToast() hook
│   │
│   ├── upload/                   # Step 1 — PDF intake
│   │   ├── upload-screen.tsx     #   layout + analyze() loop
│   │   ├── file-drop-zone.tsx    #   one box per payer
│   │   └── queue-panel.tsx       #   right column: model badge + Analyze btn
│   │
│   └── split/                    # Step 2 — drag-and-drop split
│       ├── split-screen.tsx      #   3-column layout + tally bar
│       ├── item-pill.tsx         #   card for "A only" / "B only" columns
│       ├── seam-item.tsx         #   card with split slider for "Shared"
│       ├── drop-column.tsx       #   reusable drag-target column
│       └── checkout-modal.tsx    #   final receipt + clipboard copy
│
├── lib/                          # No React. Pure logic.
│   ├── types.ts                  # Item, Bucket, Names, Settings, etc.
│   ├── constants.ts              # CAT_GLYPH, FONTS, MODEL_ID, newId()
│   ├── format.ts                 # fmt(), computeShares(), suggestBucket()
│   ├── pdf.ts                    # extractPdfText() — wraps pdf.js (client only)
│   ├── api.ts                    # parseStatement() — fetch wrapper to /api/parse
│   └── store.ts                  # Zustand store with localStorage persistence
│
├── package.json                  # dependencies + npm scripts
├── tsconfig.json                 # TypeScript config (strict mode)
├── next.config.ts                # Next.js config (minimal)
├── next-env.d.ts                 # auto-generated, don't edit
├── .env.local.example            # template for your secrets
├── .gitignore
└── README.md                     # this file
```

### Why is it laid out this way?

- **`lib/` has zero UI** — every function in `lib/` can be unit-tested without a
  browser. If you ever add Jest or Vitest, point it here.
- **`components/upload/` and `components/split/` mirror the two app steps**.
  Each subfolder is self-contained — you can rewrite Step 2 without touching
  Step 1.
- **State lives in one Zustand store** (`lib/store.ts`). No prop-drilling, no
  `window` globals (the original used `window.SplitScreen` etc. — gone).
- **The OpenAI key never reaches the browser**. The browser calls `/api/parse`,
  which runs on the server and uses `process.env.OPENAI_API_KEY`.

---

## 5. Deploy to Vercel

### One-time setup
1. Push this folder to a GitHub repo (any name).
2. Go to <https://vercel.com/new>, import the repo.
3. **Root Directory**: if your repo root is the parent folder, set this to
   `costspliter-next`. Otherwise leave it blank.
4. **Framework preset**: Vercel auto-detects Next.js — leave as-is.
5. **Environment Variables** → add:
   - Name: `OPENAI_API_KEY`
   - Value: your `sk-...` key
   - Apply to: Production, Preview, Development
6. Click **Deploy**. First build takes ~1 minute.

### Subsequent deploys
Just `git push`. Vercel rebuilds and deploys on every push to your default
branch automatically. PRs get preview URLs.

### View production logs
- <https://vercel.com> → your project → **Logs** tab. The output of
  `console.log(...)` from `app/api/parse/route.ts` shows up here in real time.

### Updating the OpenAI key on Vercel
Project → **Settings** → **Environment Variables** → edit `OPENAI_API_KEY` →
**Redeploy** (env changes don't apply to existing deployments).

---

## 6. Customising the app

| Thing                  | Where to change                        | What to change                                  |
| ---------------------- | -------------------------------------- | ----------------------------------------------- |
| OpenAI model           | `lib/constants.ts`                     | `MODEL_ID = "gpt-5"` → any supported model id   |
| Default Person A/B name| `lib/store.ts`                         | the `names: { A: ..., B: ... }` initial value   |
| Available fonts        | `lib/constants.ts` → `FONTS` array     | add `{ id, label }` AND add to `FONTS_HREF` in `app/layout.tsx` |
| Color palette          | `app/globals.css` → `:root { ... }`    | edit the `--ink`, `--accent`, `--paper`, etc.   |
| Shared-bucket hints    | `lib/format.ts` → `suggestBucket()`    | edit `sharedHints` / `sharedCats`               |
| AI parsing prompt      | `app/api/parse/route.ts` → `SYSTEM_PROMPT` | rewrite the JSON schema / instructions      |

---

## 7. Common problems

**`npm install` fails with peer-dependency warnings**
React 19 is recent — some libraries lag. If you see hard errors, try
`npm install --legacy-peer-deps`.

**Page is blank with no errors**
Open DevTools console. The most likely cause is the Zustand store reading
`localStorage` on a server render. The `mounted` gate in `components/app.tsx`
prevents this — make sure you didn't remove it.

**PDF parsing always fails with "empty PDF text"**
The PDF is a scanned image. pdf.js extracts text only — it doesn't OCR. Either
re-export the statement as a real PDF, or add an OCR step before
`extractPdfText()`.

**Dev server runs but Analyze button does nothing**
Check the terminal running `npm run dev` for an error. Most likely:
`OPENAI_API_KEY not set on server` → put a real key in `.env.local` and
restart the dev server.

**The "most modern" model isn't available on my account**
Edit `lib/constants.ts` and change `MODEL_ID` to one your account has access
to (e.g. `"gpt-4.1"`, `"gpt-4o"`, `"gpt-4o-mini"`). Save, the dev server
hot-reloads. No reinstall needed.

---

## 8. What changed from the original prototype

| Before (`../project/`)                      | After (this folder)                            |
| ------------------------------------------- | ---------------------------------------------- |
| Single HTML file with `<script>` tags       | Next.js App Router + TypeScript                |
| OpenAI key in `localStorage` (browser)      | `OPENAI_API_KEY` env var (server)              |
| Model picker in Settings                    | Hardcoded `MODEL_ID` constant (one-line swap)  |
| `window.SplitScreen`, `window.fmt`, etc.    | ES module imports + typed Zustand store        |
| Babel-in-browser transpilation              | Build-time compilation, no runtime Babel       |
| `<script src="cs-app.jsx">`                 | `app/page.tsx` → `<App />`                     |
| Manual `localStorage.setItem(...)`          | Zustand `persist` middleware                   |

Same look, same flow, same keyboard shortcuts. Different innards.
