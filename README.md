# AssetFlow Frontend

The web client for **AssetFlow**, a multi-tenant B2B SaaS product for managing physical
assets (laptops, monitors, phones, tablets, access cards, etc.). Admins bulk-import
assets, assign them to employees, track returns/repairs, and browse a full lifecycle
history for every asset. Employees get a read-only view of what's currently assigned to
them.

This repo is the frontend only. It talks to a separate backend API:
[assetflow-backend](../assetflow-backend).

## Features

- Polished, responsive B2B dashboard UI: sidebar navigation, KPI cards, tables, status
  badges, modals, toast notifications
- Dashboard with live KPIs, recent activity feed, and upcoming returns
- Assets list with server-side search, status/category filters, and pagination
- Asset details page with a full lifecycle history timeline (purchased → assigned →
  returned → repaired → retired)
- Add Assets modal with three modes: manual entry, bulk creation (e.g. generate
  `LAP-001`…`LAP-100` in one go), and CSV import with a validation preview step
- Assign / Return / Start Repair / Complete Repair / Retire flows, each with the
  appropriate modal or confirmation dialog
- Employees list + employee detail page showing currently assigned assets
- Org-wide Activity audit feed
- Role-aware UI: `ADMIN` sees everything, `EMPLOYEE` sees only their own assigned assets
- Loading, empty, and error states on every data-driven page

## Tech Stack

React, Vite, TypeScript, React Router, Tailwind CSS, Axios, Lucide React.

## Architecture

```
src/
  pages/         # one component per route (Dashboard, Assets, AssetDetails, ...)
  components/    # shared UI (modals, tables, badges, layout, empty/loading states)
  layouts/       # AppLayout (sidebar + topbar)
  hooks/         # useAuth, useToast (React context, no Redux)
  services/      # one file per API resource — thin Axios wrappers
  types/         # shared TS types mirroring the backend API shape
  utils/         # date/currency formatting, event-description helpers
```

State management is plain React state + context — no Redux. Auth (`useAuth`) and toasts
(`useToast`) are the only global contexts; everything else is local `useState`/`useEffect`
per page with a thin Axios service layer per resource.

## Local Setup

### Prerequisites

- Node.js 18+
- A running instance of [assetflow-backend](../assetflow-backend) (see that repo's README
  for setup — local Postgres + migrate + seed + `npm run dev` on port 5000)

### Install and run

```bash
npm install
cp .env.example .env      # VITE_API_URL defaults to http://localhost:5000/api
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173 and log in with the demo credentials seeded by the backend:

| Role     | Email                        | Password      |
|----------|-------------------------------|---------------|
| Admin    | admin@acme.test               | Admin@123     |
| Employee | rahul.sharma@acme.test        | Employee@123  |

## Environment Variables

```env
VITE_API_URL="http://localhost:5000/api"
```

`.env` is never committed — see `.env.example`. Point `VITE_API_URL` at wherever the
[assetflow-backend](../assetflow-backend) API is actually running (its `CLIENT_URL` env
var must in turn match wherever this app is served from, for CORS).

## Available Scripts

```bash
npm run dev       # start Vite dev server
npm run build     # type-check (tsc -b) + production build to dist/
npm run preview   # preview the production build locally
```

## Future Improvements

Out of scope for this MVP, intentionally not implemented on the frontend:

- Google Sheets import flow (Google OAuth) — CSV import covers the same need today
- SSO login screen
- Email/Slack notification preferences UI
- QR/barcode scanning UI for check-in/check-out
- Advanced analytics/reporting dashboards
- Native mobile app
