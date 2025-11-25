## Frontend Implementation Guide

GreenHarvest’s web client is a Next.js App Router project located in `frontend/`.

### Tech stack
- Next.js 15 + React 19 (App Router)
- TypeScript
- TailwindCSS + Radix UI primitives
- TanStack Query for server state, Zustand for UI state
- Socket.IO client for realtime updates

### Scripts
```
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

### Page structure
```
src/
 ├─ app/
 │   ├─ layout.tsx          # global providers, fonts, metadata
 │   ├─ page.tsx            # splash/catalog hero
 │   └─ dashboard/
 │        └─ page.tsx       # placeholder farmer dashboard
 ├─ components/
 │   ├─ Navbar.tsx
 │   ├─ ProductCard.tsx
 │   └─ RealtimeStatus.tsx
 ├─ lib/                    # API clients, socket helpers
 └─ styles/
      └─ globals.css
```

### API communication
- All requests go through `src/lib/api-client.ts` which reads `process.env.NEXT_PUBLIC_API_BASE_URL`.
- Use React Query hooks under `src/lib/hooks/` to wrap endpoints, ensuring caching + retries.
- Authentication uses HTTP-only cookies (served via proxy) or token storage via Secure LS.

### Realtime updates
- `src/lib/socket.ts` exports a singleton Socket.IO client.
- Components subscribe/unsubscribe inside `useEffect`.
- Inventory + order updates push toast notifications and mutate React Query caches.

### Styling
- Tailwind is configured in `tailwind.config.ts`.
- Theme tokens capture the “organic” palette (greens/earth tones).
- Components follow shadcn-style composition for consistency.

### Testing
- `npm run test` executes Vitest + React Testing Library.
- Add Playwright e2e specs inside `tests/e2e/` once flows stabilize.

