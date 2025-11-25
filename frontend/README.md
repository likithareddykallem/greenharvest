# GreenHarvest Frontend

Next.js App Router client for the marketplace.

## Setup
```bash
cd frontend
npm install
cp env.local.example .env.local
npm run dev
```

## Structure
- `src/app` – route segments (app router)
- `src/components` – reusable UI elements
- `src/lib` – API + Socket helpers
- `src/styles/globals.css` – Tailwind entry

## Environment
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Points to backend API (default `http://localhost:5000/api/v1`) |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO endpoint |

## Scripts
- `npm run dev` – local server
- `npm run build` – production build
- `npm run start` – serve production build
- `npm run lint` – ESLint (Next rules)

