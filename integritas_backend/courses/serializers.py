from rest_framework import serializers
from .models import Course, Module, Lesson
from authentication.serializers import UserSerializer
from authentication.models import User

class LessonSerializer(serializers.ModelSerializer):
    assigned_tutor = UserSerializer(read_only=True)
    assigned_tutor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_tutor',
        required=False,
        allow_null=True
    )

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'slug', 'content', 'video_url', 'material_url',
            'additional_videos', 'additional_materials', 'order',
            'status', 'assigned_tutor', 'assigned_tutor_id'
        ]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'status', 'lessons']

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'summary', 'track',
            'level', 'language', 'price', 'currency', 'duration_minutes',
            'thumbnail_url', 'video_url', 'status', 'instructor', 'modules'
        ]

    def to_internal_value(self, data):
        # Map frontend's 'type'/'track' to backend's 'track' ('expert' -> 'experta')
        track_val = data.get('track') or data.get('type')
        if track_val:
            data = data.copy()
            if track_val == 'expert':
                data['track'] = 'experta'
            else:
                data['track'] = track_val
        return super().to_internal_value(data)

