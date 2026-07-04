from django.db import models


class SiteSettings(models.Model):
    """
    Singleton model for storing site-wide configuration.
    Only one row should ever exist (pk=1).
    """
    hero_video = models.FileField(
        upload_to='site/hero/',
        blank=True,
        null=True,
        help_text='The welcome address video shown in the hero section of the home page.'
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
