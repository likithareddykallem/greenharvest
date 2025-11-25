## Celery Worker Playbook

### Purpose
Offload CPU/IO heavy workloads from the Node API. Celery enables:
- Image transforms & uploads (queue: `image_processing`)
- Notification fanout (queue: `notifications`)
- Analytics aggregation (queue: `analytics`)
- Compliance / reporting (queue: `reports`)

### Running locally
```
cd celery_worker
cp env.example .env
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
celery -A tasks.worker worker --loglevel=info --queues=image_processing,notifications,analytics,reports
```

Use Flower for visibility:
```
celery -A tasks.worker flower --port=5555
```

### Adding tasks
1. Place code under `celery_worker/tasks/<domain>.py`.
2. Decorate with `@celery_app.task` and align the route in `tasks/worker.py`.
3. Keep external dependencies behind helper functions for easier mocking.
4. Emit structured logs (Celery picks up std logging).
5. Update `requirements.txt` if new libs are needed.

### Deployment tips
- Run at least one worker per queue to contain runaway workloads.
- Set `--concurrency` based on CPU and workload type (IO heavy can use higher values).
- Export OTEL metrics/logs if required by ops (see env placeholders).
- Autoscale with Kubernetes `HorizontalPodAutoscaler` targeting queue depth or CPU.

