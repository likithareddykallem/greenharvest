# GreenHarvest

GreenHarvest is a full-stack marketplace where customers source fresh produce directly from farmers. The MVP delivers the required end-to-end flow (auth, catalog, checkout, payment simulation, order tracking, role dashboards) before layering on advanced capabilities (Redis locks, Celery tasks, delivery assignment, observability, and concurrency-safe inventory).

## Highlights
- **Rock-solid auth** with role-based JWT access tokens, httpOnly refresh cookies stored in Redis, login rate-limiting, and route guards for admin/farmer dashboards.
- **MVP UX**: React (Vite) frontend with catalog, product detail, cart, checkout modal (~3 s), order tracking timeline (polling + Socket.IO), plus farmer CRUD form and admin approvals.
- **Backend**: Node.js + Express + Mongoose, Redis-powered refresh tokens & inventory locks, Celery task bridge, simulated payments that create orders, delivery partner assignment, and `/metrics` (Prometheus).
- **Async + Observability**: Celery worker handles `send_order_confirmation_email`, `notify_low_stock`, `notify_delivery_assignment`. Redis locks enforce accurate stock, Prometheus/Grafana monitor `/metrics`, Logstash ready for ingestion.
- **Quality bar**: Jest + Supertest suite covers auth, catalog/order flow, concurrency lock, delivery assignment, low-stock notifications. Seed script bootstraps admin, farmers, catalog, partners, sample orders.
- **Deployable stack**: Docker Compose spins up MongoDB, Redis, backend, frontend, Celery worker, Prometheus, Grafana, Logstash placeholders. `.env.example` documents all variables.

## Project Structure
```
greenharvest/
├─ backend/              # Express API, auth, orders, tests, Dockerfile
├─ frontend/             # React + Vite app
├─ celery_worker/        # Celery tasks (Redis broker)
├─ infra/                # docker-compose.yml orchestrating full stack
├─ monitoring/           # Prometheus + Grafana + Logstash config
├─ seed/                 # Database seed script
├─ postman_collection.json
├─ prettier.config.cjs
└─ .env.example          # environment template (copy → .env)
```

## Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional, for containerized run)
- MongoDB (if running locally without Docker)
- Redis (if running locally without Docker)

## Getting Started

### Option 1: Quick Start with Docker (Recommended)
This will spin up the entire stack including databases and monitoring tools.

1.  **Configure Environment**
    Copy `.env.example` to `.env` in the root directory.
    ```bash
    cp .env.example .env
    ```

2.  **Run with Docker Compose**
    ```bash
    cd infra
    docker compose up --build
    ```
    -   Backend: http://localhost:4000
    -   Frontend: http://localhost:5173
    -   Grafana: http://localhost:3001

3.  **Seed Data**
    Open a new terminal and run:
    ```bash
    npm run seed
    ```

### Option 2: Manual Setup (Local Development)
If you prefer to run services individually.

1.  **Install Dependencies**
    ```bash
    # Root (optional, for scripts)
    npm install

    # Backend
    cd backend
    npm install

    # Frontend
    cd frontend
    npm install
    ```

2.  **Start Databases**
    Ensure MongoDB and Redis are running locally. Update `.env` with your local connection strings if they differ from defaults.

3.  **Start Backend**
    ```bash
    cd backend
    npm run dev
    ```

4.  **Start Frontend**
    ```bash
    cd frontend
    npm run dev
    ```

5.  **Start Celery Worker (Optional)**
    Requires Python installed.
    ```bash
    pip install -r celery_worker/requirements.txt
    celery -A celery_worker.app.celery_app worker --loglevel=info
    ```

## Environment Variables

Set these in `.env` (backend) and `.env` / `.env.local` (frontend) as needed:

- `MAIL_TRANSPORT_JSON` – SMTP transport JSON (default logs emails to console)
- `MAIL_FROM` – from address for transactional emails
- `ADMIN_ALERT_EMAIL` – optional platform-ops alert recipient
- `GRAFANA_BASE_URL` – backend worker target for Grafana embeds (default `http://localhost:3000`)
- `VITE_GRAFANA_DASHBOARD_URL` – frontend iframe source (usually same as above + dashboard path)
- `APP_VERSION` / `VITE_APP_VERSION` – string rendered in the footer for quick environment awareness

If you keep the default `jsonTransport`, emails will be printed to the backend console, which is perfect for local testing.

## Role-Aware UI & Navigation

- Catalog link + sticky search appear only for customers and guests.
- Farmer dashboard, order board, and analytics navigation only render for authenticated farmers/admins.
- Admins never see the customer catalog entry point to avoid cross-role confusion.
- Footer content adapts per role (public marketing info, customer support links, farmer docs, compact admin tool links).

The new shell (`Header`, `Footer`, contextual hero) keeps navigation slim, centers search, and adds micro-interactions (hover lift, skeleton loaders, lazy-loaded images) to the catalog grid and product detail pages.

## Core Endpoints
- `POST /api/auth/register | /login | /refresh`
- `GET /api/products`, `GET /api/products/:id`
- `POST /api/cart/checkout` → `POST /api/payments/simulate`
- `GET /api/orders/:id/track`
- `POST /api/products/farmer` (multipart), `GET /api/farmer/products`
- `GET /api/admin/users`, `POST /api/products/:id/approve`
- `POST /api/orders/:id/packed` assigns delivery partner + notifies
- `/metrics` for Prometheus scraping, `/health` for readiness

## Email & Notification Flows

- **Registration** – `welcome` template fires for every new user (farmers are told their approval status).
- **Order confirmation** – customer receives order summary, farmers get a “new order” email grouped by their items, and admins optionally get an alert.
- **Order status updates** – whenever a farmer/admin moves the order through `Pending → Accepted/Rejected/Cancelled → Packed → Shipped → Delivered`, the customer receives a status email and the tracking page updates in real time (Socket.IO + polling).

To test locally:
1. Ensure `MAIL_TRANSPORT_JSON={"jsonTransport":true}` (default) or point to a real SMTP sandbox.
2. Register/log in as a customer, place an order (catalog → cart → simulated payment).
3. Log in as a farmer, accept and progress the order via the farmer order board or dashboard.
4. Watch the backend console (or your SMTP inbox) for the welcome/order/status emails.

## Advanced Features (post-MVP)
- **Redis refresh store + SETNX locks** ensure single-use refresh tokens and serialized stock mutations.
- **Celery worker** (Redis broker) processes `send_order_confirmation_email`, `notify_low_stock`, and `notify_delivery_assignment`. Node backend enqueues tasks via `celery-node`; tests capture payloads for verification.
- **Delivery partner orchestration** auto-assigns partners on `mark-packed` (round-robin by assignments), records DB notifications, and pushes Socket.IO updates to tracking clients.
- **Observability & Logging**: `/metrics` (Prometheus), Grafana dashboard JSON, Logstash pipeline placeholder. Prometheus + Grafana containers included in Compose.
- **File uploads** stored in `backend/uploads` (S3 adapter hook noted in uploader middleware). Farmer dashboard uses multipart form to publish products with images.
- **Postman collection** ready for manual verification under `postman_collection.json`.

## Testing Coverage
- **Auth flow** (register/login, refresh cookie, admin route guard) → `backend/tests/auth.test.js`
- **Catalog + orders** (checkout, simulated payment, timeline) → `backend/tests/orders.test.js`
- **Inventory concurrency** (10 checkouts vs stock=3 → 3 succeed, rest 409) → `backend/tests/orders.test.js`
- **Delivery assignment & low-stock notifications** leverage the Celery task queue stub for verifiable payloads.

Run tests with `npm test` inside `backend/` (uses mongodb-memory-server + mocked Redis + Celery queue).

## Observability & Workers
- **Prometheus** scrapes `backend:4000/metrics` (default collectors). Config at `monitoring/prometheus.yml`.
- **Grafana** auto-loads dashboard `monitoring/grafana/dashboards/greenharvest-overview.json`.
- **Logstash** placeholder pipeline (`monitoring/logstash.conf`) for future Filebeat ingestion.
- **Celery worker**: `celery -A app.celery_app worker --loglevel=info` (Docker service `celery_worker`). Tasks log to stdout for traceability.

## Postman & Manual QA
Import `postman_collection.json`, set `api` variable to `http://localhost:4000`, then run the register → login → catalog → checkout → payment flow. Cookie-based refresh keeps sessions alive across requests.

## Checklist & Demo Script
**Quick checklist**
- [ ] Copy `.env.example` → `.env`
- [ ] `docker compose up --build` (inside `infra/`)
- [ ] `node seed/index.js`
- [ ] `npm test` (inside `backend/`)
- [ ] Import `postman_collection.json` (optional)

**Demo terminal script**
```bash
# 1) Register customer (MVP)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","email":"demo@example.com","password":"Secret123!","role":"customer"}'

# 2) Login → capture access token + refresh cookie
ACCESS=$(curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Secret123!"}' | grep -oP '"accessToken":"\\K[^"]+')

# 3) Browse catalog
curl http://localhost:4000/api/products

# 4) Checkout + simulate payment (replace PRODUCT_ID)
CHECKOUT=$(curl -b cookies.txt -H "Authorization: Bearer $ACCESS" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"<PRODUCT_ID>","quantity":1}]}' \
  http://localhost:4000/api/cart/checkout | jq -r '.checkoutId')
curl -b cookies.txt -H "Authorization: Bearer $ACCESS" \
  -H "Content-Type: application/json" \
  -d "{\"checkoutId\":\"$CHECKOUT\"}" \
  http://localhost:4000/api/payments/simulate

# 5) Farmer marks order packed (replace ORDER_ID, FARMER_TOKEN)
curl -H "Authorization: Bearer <FARMER_TOKEN>" \
  -X POST http://localhost:4000/api/orders/<ORDER_ID>/packed

# 6) Track timeline
curl -b cookies.txt -H "Authorization: Bearer $ACCESS" \
  http://localhost:4000/api/orders/<ORDER_ID>/track
```

