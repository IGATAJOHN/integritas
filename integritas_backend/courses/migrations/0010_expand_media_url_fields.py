from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0009_lesson_additional_materials_lesson_additional_videos"),
    ]

    operations = [
        migrations.AlterField(
            model_name="course",
            name="thumbnail_url",
            field=models.URLField(blank=True, max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name="course",
            name="video_url",
            field=models.URLField(blank=True, max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name="lesson",
            name="material_url",
            field=models.URLField(blank=True, max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name="lesson",
            name="video_url",
            field=models.URLField(blank=True, max_length=1000, null=True),
        ),
    ]
