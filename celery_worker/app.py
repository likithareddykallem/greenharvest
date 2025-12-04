import os
import time
from celery import Celery

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery("greenharvest", broker=redis_url, backend=redis_url)


@celery_app.task(name="noop")
def noop():
    pass


if __name__ == "__main__":
    celery_app.worker_main(argv=["worker", "--loglevel=info"])

