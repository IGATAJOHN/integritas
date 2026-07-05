import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-for-dev-integritas-91283')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party packages
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'cloudinary_storage',          # must come BEFORE django.contrib.staticfiles
    'cloudinary',
    
    # Custom project apps
    'authentication',
    'courses',
    'quizzes',
    'enrollments',
    'site_settings',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # must be at top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # WhiteNoise middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'integritas_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'integritas_backend.wsgi.application'

import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR}/db.sqlite3',
        conn_max_age=600
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Enable WhiteNoise to serve static files directly
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files — stored on Cloudinary CDN (Render's disk is ephemeral)
# All FileField / ImageField uploads automatically go to Cloudinary.
MEDIA_URL = '/media/'  # kept for local dev fallback
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary credentials (parsed once here so the cloudinary package is configured)
_CLOUDINARY_URL = os.getenv('CLOUDINARY_URL', '')
if _CLOUDINARY_URL.startswith('cloudinary://'):
    import cloudinary
    cloudinary.config(cloudinary_url=_CLOUDINARY_URL)
else:
    _cn = os.getenv('CLOUDINARY_CLOUD_NAME', '')
    _ak = os.getenv('CLOUDINARY_API_KEY', '')
    _as = os.getenv('CLOUDINARY_API_SECRET', '')
    if _cn and _ak and _as:
        import cloudinary
        cloudinary.config(cloud_name=_cn, api_key=_ak, api_secret=_as)

# Use Cloudinary as Django's default file storage when credentials are available
if _CLOUDINARY_URL or (os.getenv('CLOUDINARY_CLOUD_NAME') and os.getenv('CLOUDINARY_API_KEY')):
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'authentication.authentication.BearerTokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# CORS Settings
from corsheaders.defaults import default_headers

CORS_ALLOW_ALL_ORIGINS = True # Change to specific domains in production
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + [
    'idempotency-key',
]


# Disable automatic slash redirection for REST API endpoints
APPEND_SLASH = False

# Email Configuration
if DEBUG and not os.getenv('EMAIL_HOST_USER'):
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')

EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)

# Paystack Payment Gateway Integration settings
PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')

# Cloudinary — individual env var references (used by site_settings/views.py signature generator)
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', '')
# Full URL string also supported: cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_URL = os.getenv('CLOUDINARY_URL', '')
