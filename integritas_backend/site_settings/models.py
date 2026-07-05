from django.db import models


class SiteSettings(models.Model):
    """
    Singleton model for storing site-wide configuration.
    Only one row should ever exist (pk=1).

    hero_video_url  — Cloudinary (or any CDN) URL for the home-page hero video.
    hero_video_public_id — Cloudinary public_id so we can delete/overwrite it later.
    """
    hero_video_url = models.URLField(
        blank=True,
        null=True,
        max_length=1024,
        help_text='Full Cloudinary CDN URL of the hero video on the home page.'
    )
    hero_video_public_id = models.CharField(
        blank=True,
        null=True,
        max_length=512,
        help_text='Cloudinary public_id — used to delete/overwrite the asset.'
    )
    hero_video_updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return 'Site Settings'

    @classmethod
    def get_solo(cls):
        """Always return the singleton settings object (creates it if missing)."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
