import os

from celery import Celery
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
env_path = os.path.join(BASE_DIR, '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(BASE_DIR, 'env.example')
load_dotenv(dotenv_path=env_path)

BROKER_URL = os.getenv('BROKER_URL', 'redis://127.0.0.1:6379/1')
RESULT_BACKEND = os.getenv('RESULT_BACKEND', 'redis://127.0.0.1:6379/2')

celery_app = Celery(
    'greenharvest',
    broker=BROKER_URL,
    backend=RESULT_BACKEND,
    include=[
        'tasks.notifications',
        'tasks.media',
        'tasks.analytics',
        'tasks.compliance',
    ],
)

celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    worker_hijack_root_logger=False,
    task_default_queue='default',
    task_routes={
        'tasks.media.*': {'queue': 'image_processing'},
        'tasks.notifications.*': {'queue': 'notifications'},
        'tasks.analytics.*': {'queue': 'analytics'},
        'tasks.compliance.*': {'queue': 'reports'},
    },
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(name='health.ping')
def health_ping():
    return 'pong'

