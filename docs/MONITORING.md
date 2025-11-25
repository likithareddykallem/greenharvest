## Monitoring Stack

### Components
- **Prometheus** scrapes the backend (`/metrics`) every 15s.
- **Grafana** visualizes API latency, queue depth, inventory alerts.
- **Loki** (optional) ingests structured logs (Winston, Celery).
- **Alertmanager** routes SLO breaches to Slack/PagerDuty.

### Local docker-compose
`monitoring/docker-compose.yml` spins up Prometheus + Grafana wired together. Bring your own Loki if desired.

```
cd monitoring
docker compose up -d
```

Prometheus UI: `http://localhost:9090`  
Grafana UI: `http://localhost:3001` (admin / admin)

### Prometheus config
`monitoring/prometheus.yml`:
- Scrape `backend:5000` (`node` service) and `celery-worker` (Flower metrics once enabled).
- Static scrape configs now; swap with service discovery in Kubernetes.

### Dashboards
`monitoring/grafana/dashboards/greenharvest-overview.json` includes:
- API request rate + latency (P50/P95/P99)
- Redis inventory lock success rate
- Celery queue depth gauges
- Error budget burn calculation

Import it via Grafana UI (`Dashboards → Import`) or mounted provisioning.

### Alerting
Add rules under `monitoring/alerts/*.yml`. Suggested:
- API latency P95 > 400 ms for 5m.
- Celery queue depth > 100 for 10m.
- Inventory low-stock gauge above threshold.

### Production notes
- Use managed Prometheus (AMP, GMP, Azure Monitor) for scale.
- Emit OpenTelemetry traces to Honeycomb/Tempo for request correlation.
- Forward Celery / backend logs to Loki or cloud logging with trace IDs for cross-service debugging.



