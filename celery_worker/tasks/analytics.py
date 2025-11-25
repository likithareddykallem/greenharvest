from datetime import datetime, timedelta

from celery.utils.log import get_task_logger

from .worker import celery_app
from .utils.config import get_mongo_client

logger = get_task_logger(__name__)


@celery_app.task(name='tasks.analytics.compute_daily_sales')
def compute_daily_sales(days: int = 1):
    mongo = get_mongo_client()
    orders = mongo.greenharvest.orders
    cutoff = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {'$match': {'createdAt': {'$gte': cutoff}}},
        {'$group': {'_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$createdAt'}}, 'total': {'$sum': '$total.amount'}}},
        {'$sort': {'_id': 1}},
    ]

    results = list(orders.aggregate(pipeline))
    logger.info('Daily sales: %s', results)
    return results

