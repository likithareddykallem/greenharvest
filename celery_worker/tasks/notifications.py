from celery.utils.log import get_task_logger
from twilio.rest import Client as TwilioClient

from .worker import celery_app
from .utils.config import get_settings

logger = get_task_logger(__name__)
settings = get_settings()


def _twilio_client():
    if not (settings.twilio_account_sid and settings.twilio_auth_token):
        return None
    return TwilioClient(settings.twilio_account_sid, settings.twilio_auth_token)


@celery_app.task(name='tasks.notifications.send_order_confirmation', bind=True, max_retries=3, default_retry_delay=30)
def send_order_confirmation(self, phone_number: str, order_id: str):
    client = _twilio_client()
    if not client:
        logger.warning('Twilio not configured; skipping SMS for order %s', order_id)
        return False

    try:
        message = client.messages.create(
            body=f'GreenHarvest: order {order_id} confirmed! Track it in your dashboard.',
            from_=settings.twilio_from_number,
            to=phone_number,
        )
        logger.info('Sent confirmation SMS %s for order %s', message.sid, order_id)
        return True
    except Exception as exc:
        logger.exception('Failed to send confirmation SMS for order %s', order_id)
        raise self.retry(exc=exc)

