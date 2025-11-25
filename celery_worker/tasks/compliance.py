from celery.utils.log import get_task_logger

from .worker import celery_app

logger = get_task_logger(__name__)


@celery_app.task(name='tasks.compliance.generate_farmer_report')
def generate_farmer_report(farmer_id: str):
    logger.info('Generating compliance report for farmer %s', farmer_id)
    # Placeholder for PDF/CSV generation.
    return {'farmer_id': farmer_id, 'status': 'queued'}

