import os
from functools import lru_cache

from dotenv import load_dotenv
from pymongo import MongoClient

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
env_path = os.path.join(BASE_DIR, '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(BASE_DIR, 'env.example')
load_dotenv(dotenv_path=env_path)


class Settings:
    broker_url: str = os.getenv('BROKER_URL', 'redis://127.0.0.1:6379/1')
    result_backend: str = os.getenv('RESULT_BACKEND', 'redis://127.0.0.1:6379/2')
    mongodb_uri: str = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/greenharvest')
    api_base_url: str = os.getenv('API_BASE_URL', 'http://localhost:5000/api/v1')
    sendgrid_api_key: str = os.getenv('SENDGRID_API_KEY', '')
    sendgrid_from_email: str = os.getenv('SENDGRID_FROM_EMAIL', 'no-reply@greenharvest.local')
    twilio_account_sid: str = os.getenv('TWILIO_ACCOUNT_SID', '')
    twilio_auth_token: str = os.getenv('TWILIO_AUTH_TOKEN', '')
    twilio_from_number: str = os.getenv('TWILIO_FROM_NUMBER', '')
    cloudinary_url: str = os.getenv('CLOUDINARY_URL', '')
    media_bucket_url: str = os.getenv('MEDIA_BUCKET_URL', '')


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_mongo_client():
    settings = get_settings()
    return MongoClient(settings.mongodb_uri)

