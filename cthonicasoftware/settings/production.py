import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEBUG = False

ALLOWED_HOSTS = ['.cthonicasoftware.com',]
CSRF_TRUSTED_ORIGINS = ['https://*.cthonicasoftware.com',]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True