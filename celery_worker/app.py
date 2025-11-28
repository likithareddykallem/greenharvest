import os
import time
from celery import Celery

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery("greenharvest", broker=redis_url, backend=redis_url)


@celery_app.task(name="send_order_confirmation_email")
def send_order_confirmation_email(payload):
    time.sleep(1)
    print(f"[EMAIL] Order {payload.get('orderId')} confirmed for customer {payload.get('customerId')}")


@celery_app.task(name="notify_low_stock")
def notify_low_stock(payload):
    print(f"[INVENTORY] Product {payload.get('productId')} low stock: {payload.get('stock')}")


@celery_app.task(name="notify_delivery_assignment")
def notify_delivery_assignment(payload):
    print(
        f"[DELIVERY] Order {payload.get('orderId')} assigned to {payload.get('deliveryPartner')}"
    )


if __name__ == "__main__":
    celery_app.worker_main(argv=["worker", "--loglevel=info"])

