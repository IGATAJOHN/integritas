import time
import hashlib
import os

from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.conf import settings as django_settings

from .models import SiteSettings


# ── Custom permissions: checks app role field, not Django's is_staff ──────────

class IsAdminRole(permissions.BasePermission):
    """
    Allows access only to users whose `role` field is 'admin' or 'super_admin'.
    This matches the app's custom role system (not Django's is_staff flag).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        role = str(getattr(request.user, 'role', '') or '').lower()
        return role in ('admin', 'super_admin')


class IsAdminOrTutorRole(permissions.BasePermission):
    """
    Allows access to users whose `role` field is 'admin', 'super_admin', or 'tutor'.
    Tutors need access to request signatures for uploading lesson videos/materials.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        role = str(getattr(request.user, 'role', '') or '').lower()
        return role in ('admin', 'super_admin', 'tutor')



# ── helpers ──────────────────────────────────────────────────────────────────

def _get_cloudinary_creds():
    """
    Support both individual vars and the CLOUDINARY_URL string.
    CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
    """
    cloud_url = getattr(django_settings, 'CLOUDINARY_URL', '') or ''
    if cloud_url.startswith('cloudinary://'):
        # Parse: cloudinary://key:secret@cloud_name
        rest = cloud_url[len('cloudinary://'):]
        key_secret, cloud_name = rest.rsplit('@', 1)
        api_key, api_secret = key_secret.split(':', 1)
        return cloud_name.strip(), api_key.strip(), api_secret.strip()

    cloud_name = getattr(django_settings, 'CLOUDINARY_CLOUD_NAME', '') or ''
    api_key = getattr(django_settings, 'CLOUDINARY_API_KEY', '') or ''
    api_secret = getattr(django_settings, 'CLOUDINARY_API_SECRET', '') or ''
    return cloud_name.strip(), api_key.strip(), api_secret.strip()


def _cloudinary_signature(params: dict, api_secret: str) -> str:
    """
    Produce the SHA-1 signature Cloudinary expects for authenticated uploads.
    https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
    """
    # Sort params alphabetically, exclude 'file', 'api_key', 'resource_type', 'cloud_name'
    exclude = {'file', 'api_key', 'resource_type', 'cloud_name'}
    sorted_params = '&'.join(
        f'{k}={v}' for k, v in sorted(params.items()) if k not in exclude
    )
    to_sign = sorted_params + api_secret
    return hashlib.sha1(to_sign.encode('utf-8')).hexdigest()


# ── Views ─────────────────────────────────────────────────────────────────────

class CloudinarySignatureView(views.APIView):
    """
    GET /api/v1/site/cloudinary-signature?resource_type=video&folder=integritas/lessons
    Authenticated access. Returns a short-lived signed upload credential so the browser
    can upload directly to Cloudinary without routing the file through Django.

    Query params:
        resource_type  — 'video' (default) | 'raw' (PDF/docs) | 'image'
        folder         — Cloudinary folder (default: 'integritas/hero')
    """
    permission_classes = [permissions.IsAuthenticated]


    def get(self, request):
        cloud_name, api_key, api_secret = _get_cloudinary_creds()

        if not all([cloud_name, api_key, api_secret]):
            return Response(
                {
                    'message': (
                        'Cloudinary credentials are not configured on this server. '
                        'Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY '
                        '+ CLOUDINARY_API_SECRET) in your environment variables on Render.'
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        resource_type = request.query_params.get('resource_type', 'video')
        if resource_type not in ('video', 'raw', 'image'):
            resource_type = 'video'

        folder = request.query_params.get('folder', 'integritas/hero')

        timestamp = int(time.time())
        params = {
            'timestamp': timestamp,
            'folder': folder,
            'overwrite': 'true',
            'resource_type': resource_type,
        }
        signature = _cloudinary_signature(params, api_secret)

        return Response({
            'cloud_name': cloud_name,
            'api_key': api_key,
            'timestamp': timestamp,
            'folder': folder,
            'resource_type': resource_type,
            'signature': signature,
            'upload_url': f'https://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/upload',
        })


class HeroVideoView(views.APIView):
    """
    GET  /api/v1/site/hero-video   — public, returns the current hero video URL
    POST /api/v1/site/hero-video   — admin only, saves the Cloudinary URL returned
                                     by the browser after a direct upload
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        site = SiteSettings.get_solo()
        return Response({
            'hero_video_url': site.hero_video_url or None,
            'updated_at': site.hero_video_updated_at,
        })

    def post(self, request):
        video_url = request.data.get('hero_video_url', '').strip()
        public_id = request.data.get('public_id', '').strip()

        if not video_url:
            return Response(
                {'message': 'Missing required field: hero_video_url'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        site = SiteSettings.get_solo()
        site.hero_video_url = video_url
        if public_id:
            site.hero_video_public_id = public_id
        site.save()

        return Response({
            'message': 'Hero video updated successfully.',
            'hero_video_url': site.hero_video_url,
            'updated_at': site.hero_video_updated_at,
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        site = SiteSettings.get_solo()
        site.hero_video_url = ""
        site.hero_video_public_id = ""
        site.save()
        return Response({
            'message': 'Hero video deleted successfully.',
            'hero_video_url': None,
            'updated_at': site.hero_video_updated_at,
        }, status=status.HTTP_200_OK)
