# GreenHarvest Celery Worker

Python 3.12 worker that processes asynchronous workflows (image handling, notifications, analytics, compliance jobs). Built on Celery + Redis by default, but broker/result backend can be swapped for RabbitMQ/SQS if needed.

## Quick start

```bash
cd celery_worker
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && edit broker/result URIs
celery -A tasks.worker worker --loglevel=info
```

Optionally run Flower for monitoring:

```bash
celery -A tasks.worker flower --port=5555
```

## Layout

```
celery_worker/
 ├─ tasks/
 │   ├─ worker.py            # Celery app configuration
 │   ├─ __init__.py
 │   ├─ notifications.py     # Twilio/SendGrid dispatchers
 │   ├─ media.py             # Image processing, uploads
 │   ├─ analytics.py         # Aggregations, reporting
 │   ├─ compliance.py        # Certification + GDPR chores
 │   └─ utils/
 │        ├─ __init__.py
 │        └─ config.py       # Shared settings + lazy clients
 ├─ .env.example
 ├─ requirements.txt
 └─ README.md
```

## Environment variables

See `.env.example` for the canonical list. Important ones:

| Key | Description |
|-----|-------------|
| `BROKER_URL` | Celery broker (Redis/RabbitMQ) |
| `RESULT_BACKEND` | Celery result backend |
| `MONGODB_URI` | Optional direct Mongo access |
| `MEDIA_BUCKET_URL` | Cloud storage endpoint |
| `SENDGRID_API_KEY` / `TWILIO_*` | Notification providers |

## Dev notes
- Tasks are grouped by Celery queue (`constants.CELERY_QUEUES`). Start multiple workers pinned to specific queues to isolate workloads.
- Tasks publish structured logs to STDOUT; production deployments should ship logs to the central stack.
- Use `apply_async(countdown=... | eta=...)` for delayed executions (e.g., reminder SMS).
- For local testing without the whole stack, run `celery -A tasks.worker call tasks.notifications.send_order_confirmation --args='["orderId"]'`.

