## GreenHarvest Architecture & Delivery Plan

### 1. Vision & Non-Negotiables
- **Trustworthy organic commerce**: surface provenance, certifications, lab results, and handling checkpoints for every SKU.
- **Realtime-aware operations**: inventory accuracy < 2 seconds, end-to-end order visibility, proactive alerts for low stock or cold chain risk.
- **Cloud-native efficiency**: horizontal scaling, queue-backed heavy jobs, self-healing infra with clear SLOs (99.5% API uptime, < 400 ms P95).
- **Security-first**: encrypted data paths, role-based guardrails, auditable state changes, zero-trust for third-party integrations.

### 2. System Overview
```
┌────────────┐    HTTPS    ┌──────────────┐    gRPC/HTTP   ┌───────────────┐
│ Web / PWA  │◀──────────▶│ API Gateway  │◀──────────────▶│  Core Services │
│ (Next.js)  │   WebSock   │ (Express)    │   Socket.IO    │  (Node.js)     │
└────────────┘             └─────┬────────┘                ├───────────────┤
                                  │                         │ Inventory     │
                                  │                         │ Orders        │
                                  │                         │ Payments      │
                                  │                         │ Farmer Mgmt   │
                     Metrics/Logs │                         │ Traceability  │
                                  ▼                         └───────────────┘
                             Observability Stack
┌─────────────┐    Streams    ┌────────────┐    Task Queue   ┌──────────────────┐
│ MongoDB     │◀────────────▶│ Redis &    │◀───────────────▶│ Celery Workers    │
│ + Atlas     │   Cache/Lock │ Streams    │   (AMQP/Redis)  │ (Python)          │
└─────────────┘              ├────────────┤                 ├──────────────────┤
                             │ Notifications                │ Image processing │
                             │ Rate limiting                │ Docs OCR         │
                             │ Session store                │ Analytics jobs   │
                             └────────────┘                 └──────────────────┘
```

### 3. Backend slice (Express + Mongo + Redis)
- **API layers**
  - `routes/` – versioned routers grouped by bounded context (auth, catalog, orders, supply-chain, payments, farmers, analytics).
  - `controllers/` – HTTP adapters that validate input, call services, shape responses.
  - `services/` – business logic, orchestration, cache-aware patterns; keep pure for testing.
  - `models/` – Mongoose schemas with JSON schema parity for frontend types.
  - `metrics/` – Prometheus collectors (e.g., request latency, inventory lock contention).
- **Shopping journey**
  - Catalog query hits Redis cache first (`CACHE_TTL.PRODUCTS`), falls back to Mongo.
  - Inventory reservations use Redis Redlock-style locks to avoid overselling.
  - Checkout pipeline: cart validation → pricing engine → Stripe intent → order snapshot.
  - Supply chain tracker writes immutable events per stage; consumers stream updates via Socket.IO rooms.
- **Security**
  - JWT access + refresh tokens with Redis blacklist support (already scaffolded in `middleware/auth.js`).
  - Rate limiters per route group using `middleware/rateLimiter.js`.
  - Input validation through Joi schemas in `middleware/validation.js`.

### 4. Asynchronous & Data Processing (Celery)
- Queue families (`constants.CELERY_QUEUES`):
  - `image_processing`: sharp resize, watermark, CDN push.
  - `notifications`: SMS/email/WhatsApp via Twilio + SendGrid.
  - `analytics`: nightly sales aggregation, churn models.
  - `inventory_alerts`: proactive farmer alerts when thresholds hit.
  - `reports`: PDF statements, regulatory exports.
- Workers read from Redis (dev) or RabbitMQ (prod). Provide shared `.env` for broker URLs.
- Tasks repository layout (`celery_worker/tasks/`):
  - `__init__.py` & `worker.py`
  - `notifications.py`, `media.py`, `analytics.py`, `compliance.py`
  - `utils/` for common Mongo/Redis clients.

### 5. Frontend (Next.js + React Query + Tailwind)
- **App router** with server actions for cart mutations.
- **State management**: TanStack Query for data, Zustand for UI.
- **Key pages**: landing, farmer storefront, product detail, cart/checkout, order tracking timeline, farmer dashboard, admin control tower.
- **Realtime**: Socket.IO client for order/inventory updates; fallback to HTTP polling.
- **Accessibility**: WCAG AA, color-safe palettes, keyboard-friendly filters.

### 6. Observability & Reliability
- **Metrics**: `prom-client` exporter on `/metrics`, scraped by Prometheus. Important: request latency histogram, inventory lock duration, queue depth gauges.
- **Tracing**: OpenTelemetry SDK piping to Honeycomb/Jaeger; instrument key services and Celery tasks.
- **Logging**: Structured JSON via Winston + Loki/Grafana stack; log correlation IDs per request.
- **Alerting**: PagerDuty/Slack alerts for SLO breaches, queue congestion, payment failures.

### 7. Data & Compliance
- PII encrypted at rest (Mongo field-level encryption for addresses, Stripe vault for cards).
- Audit trails for order status changes (immutable `OrderEvent` collection).
- GDPR tooling: data export, delete orchestrations via Celery.
- Certifications & lab results stored in S3/Cloudinary with signed URLs.

### 8. Deployment Strategy
- **Dev**: Docker Compose (Mongo, Redis, MinIO, Localstack, Prometheus, Grafana).
- **Staging**: Kubernetes (AKS/EKS/GKE) with GitHub Actions CI/CD, feature flags toggled via LaunchDarkly.
- **Prod**: Multi-AZ cluster, auto-scaling API pods, dedicated worker pools, managed Atlas cluster with Global Writes, Redis Enterprise for HA.
- **Secrets**: Vault or cloud secret manager; never bake into images.

### 9. Delivery Roadmap (suggested)
| Milestone | Scope | Outputs |
|-----------|-------|---------|
| M0 – Foundations (2 weeks) | Repo scaffolding, CI, lint/test hooks, health endpoints | Running dev stack, baseline telemetry |
| M1 – Catalog & Farmers (3 weeks) | Auth, farmer onboarding, product CRUD, inventory locks | UI for storefront, API + tests |
| M2 – Checkout & Payments (3 weeks) | Cart, pricing, Stripe, order lifecycle events | End-to-end purchase flow |
| M3 – Supply Chain & Tracking (3 weeks) | Shipment events, traceability views, realtime sockets | Customer tracking + farmer ops |
| M4 – Analytics & Alerts (2 weeks) | Celery pipelines, dashboards, alerting | KPI dashboards, automated notifications |

### 10. Next Implementation Steps
1. Flesh out `models/` (User, FarmerProfile, Product, Inventory, Order, Shipment, PaymentIntent).
2. Implement `routes/controllers/services` for Auth + Catalog + Orders.
3. Add Redis-backed inventory reservation helpers + tests.
4. Scaffold Celery worker package with sample tasks and local dev compose file.
5. Bootstrap Next.js frontend with layout, auth provider, and basic catalog page.
6. Add Prometheus `/metrics` endpoint and Grafana dashboards in `monitoring/`.

Keep this document authoritative—update whenever architecture decisions evolve.

