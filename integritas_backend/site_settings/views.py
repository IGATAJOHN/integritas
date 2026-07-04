from rest_framework import views, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings as django_settings
from .models import SiteSettings


def _build_video_url(request, site_settings):
    """Return an absolute URL for the hero_video, or None if not set."""
    if not site_settings.hero_video:
        return None
    # Build an absolute URL using the request's scheme and host
    relative = site_settings.hero_video.url
    # hero_video.url already contains the MEDIA_URL prefix
    return request.build_absolute_uri(relative)


class HeroVideoView(views.APIView):
    """
    GET  /api/v1/site/hero-video   — public, returns the current hero video URL
    POST /api/v1/site/hero-video   — admin only, accepts multipart video upload
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        site = SiteSettings.get_solo()
        video_url = _build_video_url(request, site)
        return Response({
            'hero_video_url': video_url,
            'updated_at': site.hero_video_updated_at,
        })

    def post(self, request):
        video_file = request.FILES.get('hero_video')
        if not video_file:
            return Response(
                {'message': 'No video file provided. Send a multipart field named "hero_video".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        site = SiteSettings.get_solo()

        # Delete old file to avoid orphaned media files
        if site.hero_video:
            try:
                site.hero_video.delete(save=False)
            except Exception:
                pass

        site.hero_video = video_file
        site.save()

        return Response({
            'message': 'Hero video uploaded successfully.',
            'hero_video_url': _build_video_url(request, site),
            'updated_at': site.hero_video_updated_at,
        }, status=status.HTTP_200_OK)
