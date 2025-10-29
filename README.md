# Handyman Quote Generator

A full-stack single-page application that helps handyman companies craft professional quotes. The project ships with a React 18 + Vite frontend, an Express + SQLite backend, and integrations for AI-assisted scoping, price research, mapping, and PDF export.

## Project Structure

```
HandyManny/
├── client/              # React frontend (TypeScript, TailwindCSS, Zustand, React Hook Form)
├── server/              # Express backend (TypeScript, SQLite, Playwright scraping helpers)
├── data/                # SQLite database files (generated at runtime)
└── README.md
```

## Features

- Dashboard listing all quotes and quick creation via "+ New Quote".
- AI service chat (OpenAI fallback parser included) that extracts services, labor hours, and materials.
- Locked materials and labor tables populated from the chat output.
- Price research workflow that scrapes Home Depot & Tractor Supply (Playwright headless) with six-hour caching and manual overrides when offline.
- Travel, helpers, and profit margin calculators with automatic totals.
- Rich default Terms & Conditions with optional special conditions.
- Responsive on-screen preview plus matching PDF output (pdfmake).
- Quote persistence in SQLite including materials and labor line-items.
- REST API: `/api/quotes`, `/api/price-search`, `/api/distance`, `/api/pdf`.
- Jest unit tests for price aggregation and profit calculation utilities.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- (Optional) Google Maps Distance Matrix API key
- (Optional) OpenAI API key for GPT-based parsing

### Environment Variables

Copy the backend example environment file and adjust values as needed:

```
cp server/.env.example server/.env
```

Key variables:

- `PORT` – Express port (default `4000`).
- `DATABASE_PATH` – Path to SQLite database file.
- `OPENAI_API_KEY` / `OPENAI_MODEL` – Enable AI parsing via OpenAI.
- `GOOGLE_MAPS_API_KEY` – Enables live distance lookup.
- `DEFAULT_SHOP_ADDRESS` – Address used for travel calculations when "Default Shop" is selected.

For the frontend, create `client/.env` with:

```
VITE_API_URL=http://localhost:4000
VITE_DEFAULT_SHOP_ADDRESS=123 Main St, Springfield, USA
```

### Install Dependencies

```
cd client
npm install
cd ../server
npm install
```

### Database Migration

```
cd server
npm run build
npm run migrate
```

### Development Servers

Start the backend (port 4000):

```
cd server
npm run dev
```

Start the frontend (port 5173):

```
cd client
npm run dev
```

### Running Tests

```
cd server
npm test
```

## Deployment

- **Frontend (Vercel/Netlify):** Deploy `client/`. Ensure environment variables (`VITE_API_URL`, `VITE_DEFAULT_SHOP_ADDRESS`) are configured.
- **Backend (Render/Fly.io):** Deploy `server/` with `npm run build && npm run start`. Provide environment variables and persistent disk for `DATABASE_PATH`. Playwright requires the Chromium build; Render/Fly both support installing system dependencies automatically.

## API Prompt Template

System prompt used for the AI chat (`server/src/services/aiChat.ts`):

```
You are a handyman estimator. Parse job description into services, hours, materials. Respond in JSON with fields {"summary": string, "services": [{"service": string, "hours": number, "rate"?: number, "materials": [{"item": string, "quantity": number, "unit"?: string}]}]}. Estimate hours realistically for residential work.
```

## SQL Schema

Defined in `server/src/db/migrations/001_init.sql`.

```
quotes(id, client_json, status, margin, terms, created_at, updated_at)
quote_materials(id, quote_id, item, qty, unit, store, unit_price, total, link, manual)
quote_labor(id, quote_id, description, rate, hours, total)
```

## Default Terms & Conditions

```
**Handyman Quote – Terms & Conditions**

1. **Validity**: This quote is valid for 30 days from the date above.
2. **Payment**: 50 % deposit upon acceptance, balance due upon completion.
3. **Materials**: Prices based on current Home Depot/Tractor Supply rates; subject to change if unavailable.
4. **Labor**: Rates include travel within 50 miles; additional mileage billed at $0.20/mi.
5. **Changes**: Any client-requested changes after approval will require a revised quote.
6. **Warranty**: Workmanship guaranteed for 90 days; materials per manufacturer warranty.
7. **Cancellation**: Deposits non-refundable if work has commenced.

[Special conditions added by user appear here]
```

## Deployment Notes

- Price scraping uses Playwright. On Render or Fly.io, add the Chromium buildpack or run `npx playwright install --with-deps` during build.
- Distance lookup falls back to 10 miles when no API key is set so the workflow remains functional offline.
- Manual material overrides remain tagged (`manual = 1`) to prevent automated scrapes from overwriting technician-entered data.

## License

MIT
