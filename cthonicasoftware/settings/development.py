import os
from pathlib import Path
import sys

from .base import MIDDLEWARE as BASE_MIDDLEWARE

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEBUG = True

ALLOWED_HOSTS = ['*']
# Allow common local hosts/ports so logins and CSRF tokens work in dev.
CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
]

SECURE_SSL_REDIRECT = False