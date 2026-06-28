from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.db import models
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer, RegisterSerializer
from .models import User, Profile, TutorInvite, Notification



class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        if not username and email:
            from .models import User
            try:
                username = User.objects.get(email=email).username
            except User.DoesNotExist:
                return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                **UserSerializer(user).data
            })
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                **UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(views.APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class LogoutView(views.APIView):
    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)

class AdminTutorsView(views.APIView):
    def get(self, request):
        queryset = User.objects.filter(role='tutor')
        q = request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                models.Q(first_name__icontains=q) |
                models.Q(last_name__icontains=q) |
                models.Q(email__icontains=q) |
                models.Q(username__icontains=q)
            )
        
        per_page = int(request.query_params.get('per_page', 25))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        
        sliced_qs = queryset[start:end]
        serializer = UserSerializer(sliced_qs, many=True)
        return Response({
            'data': serializer.data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

class AdminTutorInvitesView(views.APIView):
    def get(self, request):
        invites = TutorInvite.objects.all().order_by('-created_at')
        data = [{
            'id': invite.id,
            'email': invite.email,
            'name': invite.name,
            'created_at': invite.created_at.isoformat()
        } for invite in invites]
        return Response({'data': data})

    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name')
        if not email or not name:
            return Response({'message': 'Email and name are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        invite, created = TutorInvite.objects.get_or_create(email=email, defaults={'name': name})
        if not created:
            invite.name = name
            invite.save()
            
        return Response({
            'id': invite.id,
            'email': invite.email,
            'name': invite.name,
            'created_at': invite.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)

class AdminTutorInviteRevokeView(views.APIView):
    def delete(self, request, invite_id):
        try:
            invite = TutorInvite.objects.get(id=invite_id)
            invite.delete()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except TutorInvite.DoesNotExist:
            try:
                invite = TutorInvite.objects.get(email=invite_id)
                invite.delete()
                return Response({'success': True}, status=status.HTTP_200_OK)
            except TutorInvite.DoesNotExist:
                return Response({'message': 'Invite not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminFoundationalTutorsView(views.APIView):
    def post(self, request):
        data = request.data
        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        phone = data.get('phone', '')
        bio = data.get('bio', '')
        
        if not email or not password:
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'message': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        first_name = ''
        last_name = ''
        if name:
            parts = name.strip().split(' ', 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]
                
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role='tutor'
        )
        
        avatar_url = None
        avatar_file = request.FILES.get('avatar')
        if avatar_file:
            from django.core.files.storage import default_storage
            filename = default_storage.save(f'avatars/{user.id}_{avatar_file.name}', avatar_file)
            avatar_url = default_storage.url(filename)
            
        profile = Profile.objects.create(
            user=user,
            bio=bio,
            avatar_url=avatar_url,
            is_verified=True
        )
        
        TutorInvite.objects.filter(email=email).delete()
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class AdminFoundationalTutorDetailView(views.APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, role='tutor')
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({'message': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, role='tutor')
        except User.DoesNotExist:
            return Response({'message': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)
            
        data = request.data
        if 'name' in data:
            name = data['name']
            parts = name.strip().split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
            
        if 'email' in data:
            user.email = data['email']
            
        if 'phone' in data:
            user.phone = data['phone']
            
        user.save()
        
        profile, _ = Profile.objects.get_or_create(user=user)
        if 'bio' in data:
            profile.bio = data['bio']
        profile.save()
        
        return Response(UserSerializer(user).data)

class AdminFoundationalTutorAvatarView(views.APIView):
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, role='tutor')
        except User.DoesNotExist:
            return Response({'message': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)
            
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response({'message': 'No avatar file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.core.files.storage import default_storage
        filename = default_storage.save(f'avatars/{user.id}_{avatar_file.name}', avatar_file)
        avatar_url = default_storage.url(filename)
        
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.avatar_url = avatar_url
        profile.save()
        
        return Response(UserSerializer(user).data)

class AdminFoundationalTutorResetPasswordView(views.APIView):
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, role='tutor')
        except User.DoesNotExist:
            return Response({'message': 'Tutor not found'}, status=status.HTTP_404_NOT_FOUND)
            
        password = request.data.get('password')
        if not password:
            return Response({'message': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(password)
        user.save()
        return Response({'message': 'Password reset successfully'})

class AdminStaffView(views.APIView):
    def get(self, request):
        queryset = User.objects.filter(models.Q(role__in=['admin', 'super_admin', 'support']) | models.Q(is_staff=True) | models.Q(is_superuser=True))
        
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(models.Q(role=role) | models.Q(roles_list__contains=role))
            
        q = request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                models.Q(first_name__icontains=q) |
                models.Q(last_name__icontains=q) |
                models.Q(email__icontains=q) |
                models.Q(username__icontains=q)
            )
            
        suspended = request.query_params.get('suspended')
        if suspended == 'true':
            queryset = queryset.filter(is_active=False)
        elif suspended == 'false':
            queryset = queryset.filter(is_active=True)
            
        per_page = int(request.query_params.get('per_page', 25))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        
        sliced_qs = queryset[start:end]
        serializer = UserSerializer(sliced_qs, many=True)
        return Response({
            'data': serializer.data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

    def post(self, request):
        data = request.data
        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        phone = data.get('phone', '')
        bio = data.get('bio', '')
        role = data.get('role', 'admin')
        
        if not email or not password:
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'message': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        first_name = ''
        last_name = ''
        if name:
            parts = name.strip().split(' ', 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]
                
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=role,
            is_staff=True
        )
        
        profile = Profile.objects.create(
            user=user,
            bio=bio,
            is_verified=True
        )
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class AdminStaffDetailView(views.APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        return Response(UserSerializer(user).data)

    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        data = request.data
        if 'name' in data:
            name = data['name']
            parts = name.strip().split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
            
        if 'email' in data:
            user.email = data['email']
            
        if 'phone' in data:
            user.phone = data['phone']
            
        if 'role' in data:
            user.role = data['role']
            
        user.save()
        
        profile, _ = Profile.objects.get_or_create(user=user)
        if 'bio' in data:
            profile.bio = data['bio']
        profile.save()
        
        return Response(UserSerializer(user).data)

    def delete(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return Response({'success': True}, status=status.HTTP_200_OK)

class AdminStaffRolesView(views.APIView):
    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        roles = request.data.get('roles', [])
        user.roles_list = roles
        if roles:
            user.role = roles[0]
        user.save()
        return Response(UserSerializer(user).data)

class AdminStaffPermissionsView(views.APIView):
    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        permissions = request.data.get('permissions', [])
        user.permissions_list = permissions
        user.save()
        return Response(UserSerializer(user).data)

class AdminStaffResetPasswordView(views.APIView):
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        password = request.data.get('password')
        if not password:
            return Response({'message': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'message': 'Password reset successfully'})

class AdminStaffSuspendView(views.APIView):
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user.is_active = False
        user.save()
        return Response(UserSerializer(user).data)

class AdminStaffUnsuspendView(views.APIView):
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user.is_active = True
        user.save()
        return Response(UserSerializer(user).data)

class AdminStaffAvatarView(views.APIView):
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response({'message': 'No avatar file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.core.files.storage import default_storage
        filename = default_storage.save(f'avatars/{user.id}_{avatar_file.name}', avatar_file)
        avatar_url = default_storage.url(filename)
        
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.avatar_url = avatar_url
        profile.save()
        
        return Response(UserSerializer(user).data)

class MyNotificationsView(views.APIView):
    def get(self, request):
        queryset = Notification.objects.filter(user=request.user).order_by('-created_at')
        per_page = int(request.query_params.get('per_page', 20))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        
        sliced_qs = queryset[start:end]
        data = [{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat()
        } for n in sliced_qs]
        
        return Response({
            'data': data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

class MyNotificationsUnreadCountView(views.APIView):
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})

class MyNotificationsReadView(views.APIView):
    def post(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'success': True})

class MyNotificationsReadAllView(views.APIView):
    def post(self, request):
        Notification.objects.filter(user=request.user).update(is_read=True)
        return Response({'success': True})


