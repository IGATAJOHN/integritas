from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Course, Module, Lesson
from .serializers import CourseSerializer, ModuleSerializer, LessonSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        track = self.request.query_params.get('track', None)
        if track:
            queryset = queryset.filter(track=track)
        return queryset

from rest_framework import views, status
from django.shortcuts import get_object_or_404

class ModuleDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        return Response(ModuleSerializer(module).data)

    def patch(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        serializer = ModuleSerializer(module, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        module.delete()
        return Response({'success': True}, status=status.HTTP_200_OK)

class CourseModulesView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        serializer = ModuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseModulesReorderView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        order_list = request.data.get('order', [])
        for idx, mod_id in enumerate(order_list):
            Module.objects.filter(id=mod_id, course=course).update(order=idx)
        return Response({'success': True}, status=status.HTTP_200_OK)

class ModuleLessonsView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        serializer = LessonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(module=module)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ModuleLessonsReorderView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        order_list = request.data.get('order', [])
        for idx, lesson_id in enumerate(order_list):
            Lesson.objects.filter(id=lesson_id, module=module).update(order=idx)
        return Response({'success': True}, status=status.HTTP_200_OK)

class LessonDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        return Response(LessonSerializer(lesson).data)

    def patch(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        lesson.delete()
        return Response({'success': True}, status=status.HTTP_200_OK)

class LessonPublishView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        lesson.status = 'published'
        lesson.save()
        return Response(LessonSerializer(lesson).data, status=status.HTTP_200_OK)

class LessonUnpublishView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        lesson.status = 'draft'
        lesson.save()
        return Response(LessonSerializer(lesson).data, status=status.HTTP_200_OK)

class LessonVideoUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        video_file = request.FILES.get('video')
        if not video_file:
            return Response({'message': 'No video file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.core.files.storage import default_storage
        filename = default_storage.save(f'videos/{lesson.id}_{video_file.name}', video_file)
        video_url = default_storage.url(filename)
        
        lesson.video_url = video_url
        lesson.save()
        return Response(LessonSerializer(lesson).data, status=status.HTTP_200_OK)

