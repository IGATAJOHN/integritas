from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('site_settings', '0001_initial'),
    ]

    operations = [
        # Drop the old FileField
        migrations.RemoveField(
            model_name='sitesettings',
            name='hero_video',
        ),
        # Add URL + public_id string fields
        migrations.AddField(
            model_name='sitesettings',
            name='hero_video_url',
            field=models.URLField(
                blank=True,
                null=True,
                max_length=1024,
                help_text='Full Cloudinary CDN URL of the hero video on the home page.'
            ),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='hero_video_public_id',
            field=models.CharField(
                blank=True,
                null=True,
                max_length=512,
                help_text='Cloudinary public_id — used to delete/overwrite the asset.'
            ),
        ),
    ]
