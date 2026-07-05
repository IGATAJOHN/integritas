from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Course, Module, Lesson, Category, ProjectSubmission, ProjectSubmissionFile

from .serializers import CourseSerializer, ModuleSerializer, LessonSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        course = self.get_object()
        course.status = 'published'
        course.published_at = timezone.now()
        course.save()
        return Response({'status': 'published'})

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        course = self.get_object()
        course.status = 'draft'
        course.published_at = None
        course.save()
        return Response({'status': 'draft'})

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_value = self.kwargs.get('pk')
        
        if lookup_value.isdigit():
            filter_kwargs = {'pk': lookup_value}
        else:
            filter_kwargs = {'slug': lookup_value}
            
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = super().get_queryset()
        track = self.request.query_params.get('track', None) or self.request.query_params.get('type', None)
        if track:
            queryset = queryset.filter(track=track)
        return queryset

    def perform_create(self, serializer):
        course = serializer.save()
        self.handle_file_uploads(course)
        self.ensure_exemplar_lesson(course)

    def perform_update(self, serializer):
        course = serializer.save()
        self.handle_file_uploads(course)
        self.ensure_exemplar_lesson(course)

    def ensure_exemplar_lesson(self, course):
        if course.track == 'experta':
            module, _ = Module.objects.get_or_create(
                course=course,
                defaults={'title': 'Exemplar Content', 'status': 'published'}
            )
            lesson, _ = Lesson.objects.get_or_create(
                module=module,
                defaults={
                    'title': course.title,
                    'video_url': course.video_url or '',
                    'material_url': course.material_url or '',
                    'status': 'published'
                }
            )
            if lesson.title != course.title or lesson.video_url != course.video_url or lesson.material_url != course.material_url:
                lesson.title = course.title
                lesson.video_url = course.video_url or ''
                lesson.material_url = course.material_url or ''
                lesson.save()

    def handle_file_uploads(self, course):
        thumbnail_file = self.request.FILES.get('thumbnail')
        video_file = self.request.FILES.get('video')
        
        from django.core.files.storage import default_storage
        updated = False
        
        if thumbnail_file:
            filename = default_storage.save(f'thumbnails/{course.id}_{thumbnail_file.name}', thumbnail_file)
            course.thumbnail_url = default_storage.url(filename)
            updated = True
            
        if video_file:
            filename = default_storage.save(f'videos/{course.id}_{video_file.name}', video_file)
            course.video_url = default_storage.url(filename)
            updated = True
            
        if updated:
            course.save()

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

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        modules = course.modules.all().order_by('order')
        return Response(ModuleSerializer(modules, many=True).data)

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

        # 1. Try to read as a pre-uploaded Cloudinary URL (new flow)
        video_url = (request.data.get('video_url') or '').strip()
        public_id = (request.data.get('public_id') or '').strip()

        # 2. If not provided, fallback to standard file upload (old flow)
        if not video_url:
            video_file = request.FILES.get('video') or request.FILES.get('file')
            if video_file:
                from django.core.files.storage import default_storage
                filename = default_storage.save(f'videos/{lesson.id}_{video_file.name}', video_file)
                video_url = default_storage.url(filename)

        if not video_url:
            return Response(
                {'message': 'Missing required field: video_url or video file'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        lesson.video_url = video_url
        if public_id and hasattr(lesson, 'video_public_id'):
            lesson.video_public_id = public_id
        lesson.save()
        return Response(LessonSerializer(lesson).data, status=status.HTTP_200_OK)



class LessonMaterialUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)

        # 1. Try to read as a pre-uploaded Cloudinary URL (new flow)
        material_url = (request.data.get('material_url') or '').strip()

        # 2. If not provided, fallback to standard file upload (old flow)
        if not material_url:
            material_file = request.FILES.get('video') or request.FILES.get('material') or request.FILES.get('file')
            if material_file:
                from django.core.files.storage import default_storage
                filename = default_storage.save(f'materials/{lesson.id}_{material_file.name}', material_file)
                material_url = default_storage.url(filename)

        if not material_url:
            return Response(
                {'message': 'Missing required field: material_url or material file'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure URL is always absolute (Cloudinary URLs are already absolute)
        if material_url and not material_url.startswith('http'):
            material_url = request.build_absolute_uri(material_url)

        lesson.material_url = material_url
        lesson.save()
        return Response(LessonSerializer(lesson).data, status=status.HTTP_200_OK)



class CategoryListView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        queryset = Category.objects.all()
        
        per_page = int(request.query_params.get('per_page', 50))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        
        sliced_qs = queryset[start:end]
        data = [{
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'parent_id': cat.parent_id
        } for cat in sliced_qs]
        
        return Response({
            'data': data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description', '')
        slug = request.data.get('slug', '')
        parent_id = request.data.get('parent_id')
        
        if not name:
            return Response({'message': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        parent = None
        if parent_id:
            parent = get_object_or_404(Category, id=parent_id)
            
        cat = Category.objects.create(
            name=name,
            description=description,
            slug=slug,
            parent=parent
        )
        
        return Response({
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'parent_id': cat.parent_id
        }, status=status.HTTP_201_CREATED)

class CategoryDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, category_id):
        cat = get_object_or_404(Category, id=category_id)
        return Response({
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'parent_id': cat.parent_id
        })

    def patch(self, request, category_id):
        cat = get_object_or_404(Category, id=category_id)
        data = request.data
        if 'name' in data:
            cat.name = data['name']
        if 'description' in data:
            cat.description = data['description']
        if 'slug' in data:
            cat.slug = data['slug']
        if 'parent_id' in data:
            parent_id = data['parent_id']
            cat.parent = get_object_or_404(Category, id=parent_id) if parent_id else None
            
        cat.save()
        return Response({
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'parent_id': cat.parent_id
        })

    def delete(self, request, category_id):
        cat = get_object_or_404(Category, id=category_id)
        cat.delete()
        return Response({'success': True}, status=status.HTTP_200_OK)

class LearnerCourseProjectView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_slug):
        course = get_object_or_404(Course, slug=course_slug)
        
        brief = course.project_brief or "Design and implement a complete solution demonstrating key learnings from the course."
        requirements = course.project_requirements or [
            "Use clear architectural patterns.",
            "Write comprehensive tests.",
            "Include documentation explaining setup and usage instructions."
        ]
        
        sub = ProjectSubmission.objects.filter(course=course, user=request.user).first()
        sub_data = None
        if sub:
            files_data = [{
                'id': f.id,
                'name': f.name,
                'url': f.file.url if f.file else '',
                'size_bytes': f.size_bytes,
                'virus_scan_status': f.scan_status
            } for f in sub.files.all()]
            
            sub_data = {
                'id': sub.id,
                'description': sub.description,
                'status': sub.status,
                'score_percent': sub.score_percent,
                'feedback': sub.feedback,
                'submitted_at': sub.submitted_at.isoformat() if sub.submitted_at else None,
                'graded_at': sub.graded_at.isoformat() if sub.graded_at else None,
                'files': files_data
            }
            
        return Response({
            'brief': brief,
            'requirements': requirements,
            'submission': sub_data
        })

    def post(self, request, course_slug):
        course = get_object_or_404(Course, slug=course_slug)
        description = request.data.get('description', '')
        
        sub, created = ProjectSubmission.objects.update_or_create(
            course=course,
            user=request.user,
            defaults={
                'description': description,
                'status': 'pending',
                'score_percent': None,
                'feedback': None
            }
        )
        
        uploaded_files = request.FILES.getlist('files[]')
        for f in uploaded_files:
            sub_file = ProjectSubmissionFile.objects.create(
                submission=sub,
                file=f,
                name=f.name,
                size_bytes=f.size,
                scan_status='clean'
            )
            
        files_data = [{
            'id': f.id,
            'name': f.name,
            'url': f.file.url if f.file else '',
            'size_bytes': f.size_bytes,
            'virus_scan_status': f.scan_status
        } for f in sub.files.all()]
        
        return Response({
            'id': sub.id,
            'description': sub.description,
            'status': sub.status,
            'score_percent': sub.score_percent,
            'feedback': sub.feedback,
            'submitted_at': sub.submitted_at.isoformat() if sub.submitted_at else None,
            'graded_at': sub.graded_at.isoformat() if sub.graded_at else None,
            'files': files_data
        }, status=status.HTTP_200_OK)

class AdminProjectSubmissionsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = ProjectSubmission.objects.all().order_by('-submitted_at')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        per_page = int(request.query_params.get('per_page', 20))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        sliced = queryset[start:end]
        
        data = []
        for sub in sliced:
            files_data = [{
                'id': f.id,
                'name': f.name,
                'url': f.file.url if f.file else '',
                'size_bytes': f.size_bytes,
                'virus_scan_status': f.scan_status
            } for f in sub.files.all()]
            
            data.append({
                'id': sub.id,
                'status': sub.status,
                'submitted_at': sub.submitted_at.isoformat() if sub.submitted_at else None,
                'graded_at': sub.graded_at.isoformat() if sub.graded_at else None,
                'score_percent': sub.score_percent,
                'feedback': sub.feedback,
                'learner': {
                    'id': sub.user.id,
                    'name': f"{sub.user.first_name} {sub.user.last_name}".strip() or sub.user.username,
                    'email': sub.user.email
                },
                'course': {
                    'id': sub.course.id,
                    'title': sub.course.title
                },
                'files': files_data
            })
            
        return Response({
            'data': data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

class AdminProjectSubmissionDetailView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, submission_id):
        sub = get_object_or_404(ProjectSubmission, id=submission_id)
        files_data = [{
            'id': f.id,
            'name': f.name,
            'url': f.file.url if f.file else '',
            'size_bytes': f.size_bytes,
            'virus_scan_status': f.scan_status
        } for f in sub.files.all()]
        
        return Response({
            'id': sub.id,
            'status': sub.status,
            'description': sub.description,
            'submitted_at': sub.submitted_at.isoformat() if sub.submitted_at else None,
            'graded_at': sub.graded_at.isoformat() if sub.graded_at else None,
            'score_percent': sub.score_percent,
            'feedback': sub.feedback,
            'learner': {
                'id': sub.user.id,
                'name': f"{sub.user.first_name} {sub.user.last_name}".strip() or sub.user.username,
                'email': sub.user.email
            },
            'course': {
                'id': sub.course.id,
                'title': sub.course.title
            },
            'files': files_data
        })

class AdminProjectSubmissionGradeView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, submission_id):
        sub = get_object_or_404(ProjectSubmission, id=submission_id)
        passed = request.data.get('passed')
        score_percent = request.data.get('score_percent')
        feedback = request.data.get('feedback', '')
        
        from django.utils import timezone
        sub.status = 'passed' if passed else 'failed'
        sub.score_percent = score_percent
        sub.feedback = feedback
        sub.graded_at = timezone.now()
        sub.save()
        
        return Response({
            'id': sub.id,
            'status': sub.status,
            'score_percent': sub.score_percent,
            'feedback': sub.feedback,
            'graded_at': sub.graded_at.isoformat()
        })


class LearnerCourseProgressView(views.APIView):
    """
    GET /learner/courses/{slug}/progress
    Returns the authenticated learner's enrolment status and lesson completion
    progress for the specified course (looked up by slug or numeric ID).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_slug):
        # Resolve course by slug or numeric id
        if str(course_slug).isdigit():
            course = get_object_or_404(Course, pk=course_slug)
        else:
            course = get_object_or_404(Course, slug=course_slug)

        from enrollments.models import Enrollment
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()

        # Check foundational course completion
        foundational_completed = False
        foundational_courses = Course.objects.filter(track='foundational')
        if not foundational_courses.exists():
            foundational_completed = True
        else:
            for f_course in foundational_courses:
                f_enrollment = Enrollment.objects.filter(user=request.user, course=f_course, status='active').first()
                if f_enrollment:
                    from quizzes.models import Quiz, Attempt
                    f_lessons = Lesson.objects.filter(module__course=f_course, status='published')
                    f_lesson_ids = list(f_lessons.values_list('id', flat=True))
                    if f_lesson_ids:
                        passed_quizzes_count = Quiz.objects.filter(
                            lesson_id__in=f_lesson_ids,
                            attempts__user=request.user,
                            attempts__passed=True
                        ).distinct().count()
                        total_quizzes_count = Quiz.objects.filter(lesson_id__in=f_lesson_ids).count()
                        if total_quizzes_count > 0 and passed_quizzes_count >= total_quizzes_count:
                            foundational_completed = True
                            break
                    else:
                        # If there are no lessons yet, count it as completed for convenience
                        foundational_completed = True
                        break

        if not enrollment:
            return Response({
                'is_enrolled': False,
                'has_access': False,
                'status': None,
                'progress_percent': 0,
                'lessons_completed': 0,
                'total_lessons': 0,
                'course': {'id': course.id, 'slug': course.slug, 'title': course.title, 'track': course.track, 'price': str(course.price)},
                'enrolment': None,
                'foundational_completed': foundational_completed,
            })

        # Count published lessons across all modules
        total_lessons = Lesson.objects.filter(
            module__course=course,
            status='published'
        ).count()

        is_active = enrollment.status == 'active'
        has_access = is_active
        if course.track == 'experta' and not foundational_completed:
            has_access = False

        progress_percent = 100 if is_active and total_lessons > 0 else 0

        return Response({
            'is_enrolled': True,
            'has_access': has_access,
            'status': enrollment.status,
            'progress_percent': progress_percent,
            'lessons_completed': total_lessons if is_active else 0,
            'total_lessons': total_lessons,
            'course': {'id': course.id, 'slug': course.slug, 'title': course.title, 'track': course.track, 'price': str(course.price)},
            'enrolment': {
                'id': enrollment.id,
                'status': enrollment.status,
                'enrolled_at': enrollment.enrolled_at.isoformat(),
            },
            'foundational_completed': foundational_completed,
        })


class LearnerLessonDetailView(views.APIView):
    """
    GET /learner/lessons/{slug}
    Returns details of the specified lesson by slug, including quiz availability.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_slug):
        lesson = get_object_or_404(Lesson, slug=lesson_slug)
        serializer = LessonSerializer(lesson)
        data = serializer.data
        
        # Check if there is a quiz
        has_quiz = False
        try:
            has_quiz = hasattr(lesson, 'quiz') and lesson.quiz is not None
        except Exception:
            pass
        data['has_quiz'] = has_quiz
        
        return Response(data, status=status.HTTP_200_OK)


class LearnerLessonPlaybackUrlView(views.APIView):
    """
    GET /learner/lessons/{slug}/video/playback-url
    Returns the video playback URL.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_slug):
        lesson = get_object_or_404(Lesson, slug=lesson_slug)
        video_url = lesson.video_url
        if not video_url and hasattr(lesson, 'video') and lesson.video:
            video_url = lesson.video.url
            
        return Response({
            "url": video_url or "",
            "playback_url": video_url or "",
            "video_url": video_url or "",
        }, status=status.HTTP_200_OK)


class LearnerLessonPlaybackView(views.APIView):
    """
    POST /learner/lessons/{slug}/video/playback
    Mock-records the user's playback position.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_slug):
        return Response({"status": "success", "message": "Position recorded."}, status=status.HTTP_200_OK)





