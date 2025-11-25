from io import BytesIO

import requests
from celery.utils.log import get_task_logger
from PIL import Image

from .worker import celery_app
from .utils.config import get_settings

logger = get_task_logger(__name__)
settings = get_settings()


def _resize(image_bytes: bytes, size: tuple[int, int]) -> bytes:
    with Image.open(BytesIO(image_bytes)) as img:
        img = img.convert('RGB')
        img.thumbnail(size, Image.Resampling.LANCZOS)
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        return buffer.getvalue()


@celery_app.task(name='tasks.media.generate_variants')
def generate_variants(source_url: str, product_id: str):
    logger.info('Generating media variants for product %s', product_id)
    resp = requests.get(source_url, timeout=10)
    resp.raise_for_status()

    original = resp.content
    variants = {
        'thumbnail': _resize(original, (150, 150)),
        'small': _resize(original, (300, 300)),
        'medium': _resize(original, (600, 600)),
    }

    # In real implementation push to Cloudinary or S3.
    # Here we log the byte counts as proof of life.
    for name, blob in variants.items():
        logger.info('Variant %s generated (%d bytes) for product %s', name, len(blob), product_id)

    return True

