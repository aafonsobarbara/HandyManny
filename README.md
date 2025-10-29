# Handymanny Calculator

Handymanny Calculator is a single-page web application that helps handyman teams build professional quotes with AI-assisted scoping, live material price research, detailed labor calculations, and PDF-ready previews. The entire experience runs in the browser with session drafts persisted to `localStorage`.

## Tech Stack Choice

- **React + Vite + TypeScript** – Modern DX, fast HMR, and TypeScript safety for complex quoting data. Vite keeps the bundle lightweight and ideal for static hosting.
- **Tailwind CSS** – Utility-first styling delivers a consistent design system with minimal CSS payload.
- **Zustand** – Tiny yet powerful global store for quotes/settings with straightforward `localStorage` persistence.
- **Zod** – (included for future validation expansion) ready for form validation if serverless deploys require stronger guards.
- **jsPDF + html2canvas** – Client-side PDF generation that mirrors on-screen previews without a server.

This combination balances maintainability, performance, and ease-of-use for both designers and developers. All dependencies are tree-shakeable and production-ready for deployment on static hosts like Vercel or Netlify.

## Getting Started

```bash
npm install
npm run dev
```

### Build & Preview

```bash
npm run build
npm run preview
```

### Tests

```bash
npm run test
```

Vitest covers core financial math: gas cost, margin application, and overall profit totals.

## Environment Variables

Create a `.env` file (never commit secrets) and provide:

```
VITE_OPENAI_API_KEY=sk-your-key
# Optional: used for future map integrations
VITE_GOOGLE_MAPS_KEY=
```

The OpenAI key enables client-side calls to the `gpt-4o-mini` chat completion endpoint.

## Project Structure

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.cjs
├── postcss.config.cjs
├── .env.example
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── constants/
│   │   └── terms.ts
│   ├── components/
│   │   ├── DashboardList.tsx
│   │   ├── QuoteBuilder.tsx
│   │   ├── SettingsSheet.tsx
│   │   └── quote/
│   │       ├── AIChatPanel.tsx
│   │       ├── LaborAndTravel.tsx
│   │       ├── LockedTables.tsx
│   │       ├── PriceResearch.tsx
│   │       ├── ProfitMargin.tsx
│   │       ├── QuoteDetailsForm.tsx
│   │       ├── QuotePreview.tsx
│   │       └── TermsConditions.tsx
│   ├── services/
│   │   ├── ai.ts
│   │   └── pricing.ts
│   ├── store/
│   │   ├── QuoteStoreProvider.tsx
│   │   └── createQuoteStore.ts
│   ├── types/
│   │   └── quote.ts
│   ├── utils/
│   │   ├── calculations.test.ts
│   │   ├── calculations.ts
│   │   ├── format.ts
│   │   └── nanoid.ts
│   └── workers/
│       └── priceSearchWorker.ts
```

## Key Implementation Details

- **Local Persistence** – The Zustand store serializes quotes and settings to `localStorage` using the key `handyman-quotes-v1`. Hydration happens on boot; drafts survive refreshes but stay on-device.
- **AI Service Chat** – `src/services/ai.ts` crafts a structured system prompt (see `AI_SYSTEM_PROMPT`) and posts directly to OpenAI’s Chat Completions API, expecting strict JSON to map into services/materials.
- **Price Research Worker** – `src/workers/priceSearchWorker.ts` runs inside a Web Worker to fetch public search JSON from The Home Depot and Tractor Supply. `src/services/pricing.ts` manages caching (6h TTL) and orchestrates worker messages. Manual entry is available when responses fail or offline.
- **PDF Generation** – `QuotePreview.tsx` uses html2canvas + jsPDF to capture the preview card and produce a client-downloadable PDF without a server.
- **Financial Math** – `src/utils/calculations.ts` centralizes materials, labor, helper, fuel, and margin math. Tests ensure profit metrics remain accurate as inputs change.
- **Terms & Conditions** – Hard-coded defaults live in `src/constants/terms.ts` and are editable in Settings. Custom user conditions append in the preview.

## Deployment

Run `npm run build` and deploy the `dist/` folder to any static hosting provider (Vercel, Netlify, Cloudflare Pages). No backend services are required.

## AI System Prompt

Located in `src/services/ai.ts` as `AI_SYSTEM_PROMPT`. It instructs `gpt-4o-mini` to return strict JSON describing `services` and `materials` arrays, ensuring clean parsing on the client.

## Price Search Worker Notes

The worker hits the public JSON endpoints exposed by Home Depot (`/federated-search/v2`) and Tractor Supply (`/api/search/v1/products`). Responses are cached for six hours to avoid rate limits. If CORS/network issues occur, the UI prompts manual pricing.

## Persistence Safeguards

- Drafts & settings persist in `localStorage` (key `handyman-quotes-v1`).
- Price lookups cache in `localStorage` under `handyman-price-cache-v1` with timestamp-based invalidation.
- “Clear All Drafts” in the header wipes persisted data for a clean start.

## Default Terms & Conditions

The default block (also in Settings) is:

```
**Handyman Quote – Terms & Conditions**

1. **Validity**: This quote is valid for 30 days from the date above.
2. **Payment**: 50 % deposit upon acceptance, balance due upon completion.
3. **Materials**: Prices based on current Home Depot / Tractor Supply rates; subject to change if unavailable.
4. **Labor**: Rates include travel; fuel calculated at $0.20/mi.
5. **Changes**: Any client-requested changes after approval require a revised quote.
6. **Warranty**: Workmanship guaranteed for 90 days; materials per manufacturer warranty.
7. **Cancellation**: Deposits non-refundable once work has begun.

[Special conditions added by user appear here]
```

## Accessibility & UX

- Keyboard focus states and semantic tables support fast data entry.
- Responsive layout: the AI chat sits in a right sidebar on desktop and collapses when closed on smaller screens.
- Status badges and totals make quote health obvious before export.

Enjoy building polished quotes with Handymanny! 💪🛠️
