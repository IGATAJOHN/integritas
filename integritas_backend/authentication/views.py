from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.db import models
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer, RegisterSerializer, AuditLogSerializer
from .models import User, Profile, TutorInvite, Notification, KycSubmission, AuditLog



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
            role='tutor',
            is_foundational=True
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

class SupportUsersView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        queryset = User.objects.all()
        
        per_page = int(request.query_params.get('per_page', 100))
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

class TutorProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        profile = getattr(request.user, 'profile', None)
        skills = profile.skills if profile else []
        if isinstance(skills, str):
            import json
            try:
                skills = json.loads(skills)
            except Exception:
                skills = []
                
        data_payload = {
            'phone': request.user.phone or '',
            'country': profile.country if profile else '',
            'state': profile.state if profile else '',
            'city': profile.city if profile else '',
            'address': profile.address if profile else '',
            'bio': profile.bio if profile else '',
            'highest_education': profile.highest_education if profile else '',
            'skills': skills,
            'bank_name': profile.bank_name if profile else '',
            'account_name': profile.account_name if profile else '',
            'account_number': profile.account_number if profile else '',
        }
        
        response_data = serializer.data
        response_data['data'] = data_payload
        return Response(response_data)

class TutorKycSubmitView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        gov_file = request.FILES.get('government_id')
        qual_file = request.FILES.get('qualification')
        photo_file = request.FILES.get('photo')
        
        from django.core.files.storage import default_storage
        government_id_url = None
        qualification_url = None
        photo_url = None
        
        if gov_file:
            filename = default_storage.save(f'kyc/{request.user.id}_gov_{gov_file.name}', gov_file)
            government_id_url = default_storage.url(filename)
        if qual_file:
            filename = default_storage.save(f'kyc/{request.user.id}_qual_{qual_file.name}', qual_file)
            qualification_url = default_storage.url(filename)
        if photo_file:
            filename = default_storage.save(f'kyc/{request.user.id}_photo_{photo_file.name}', photo_file)
            photo_url = default_storage.url(filename)
            
        submission = KycSubmission.objects.create(
            user=request.user,
            status='submitted',
            government_id=government_id_url,
            qualification=qualification_url,
            photo=photo_url
        )
        
        return Response({
            'id': submission.id,
            'status': submission.status,
            'submitted_at': submission.submitted_at.isoformat(),
            'government_id': submission.government_id,
            'qualification': submission.qualification,
            'photo': submission.photo
        }, status=status.HTTP_201_CREATED)

class TutorKycUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        
        data = request.data
        
        # Update User fields
        if 'phone' in data:
            user.phone = data['phone']
            user.save()
            
        # Update Profile fields
        if 'country' in data:
            profile.country = data['country']
        if 'state' in data:
            profile.state = data['state']
        if 'city' in data:
            profile.city = data['city']
        if 'address' in data:
            profile.address = data['address']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'highest_education' in data:
            profile.highest_education = data['highest_education']
        if 'skills' in data:
            skills = data['skills']
            if isinstance(skills, str):
                import json
                try:
                    skills = json.loads(skills)
                except Exception:
                    pass
            profile.skills = skills
        if 'bank_name' in data:
            profile.bank_name = data['bank_name']
        if 'account_name' in data:
            profile.account_name = data['account_name']
        if 'account_number' in data:
            profile.account_number = data['account_number']
            
        profile.save()
        
        serializer = UserSerializer(user)
        response_data = serializer.data
        
        skills = profile.skills
        if isinstance(skills, str):
            import json
            try:
                skills = json.loads(skills)
            except Exception:
                skills = []
                
        response_data['data'] = {
            'phone': user.phone or '',
            'country': profile.country or '',
            'state': profile.state or '',
            'city': profile.city or '',
            'address': profile.address or '',
            'bio': profile.bio or '',
            'highest_education': profile.highest_education or '',
            'skills': skills,
            'bank_name': profile.bank_name or '',
            'account_name': profile.account_name or '',
            'account_number': profile.account_number or '',
        }
        return Response(response_data)

class TutorEarningsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'summary': {
                'total_earned': 0.0,
                'available_balance': 0.0,
                'pending_payout': 0.0
            },
            'payouts': []
        })

class AdminKycQueueView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        role_filter = request.query_params.get('role')
        q_filter = request.query_params.get('q')
        
        queryset = KycSubmission.objects.all().order_by('-submitted_at')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if role_filter:
            queryset = queryset.filter(user__role=role_filter)
        if q_filter:
            queryset = queryset.filter(
                models.Q(user__first_name__icontains=q_filter) |
                models.Q(user__last_name__icontains=q_filter) |
                models.Q(user__email__icontains=q_filter)
            )
            
        per_page = int(request.query_params.get('per_page', 20))
        page = int(request.query_params.get('page', 1))
        
        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        sliced = queryset[start:end]
        
        data = []
        for k in sliced:
            profile = getattr(k.user, 'profile', None)
            skills = profile.skills if profile else []
            if isinstance(skills, str):
                import json
                try:
                    skills = json.loads(skills)
                except Exception:
                    skills = []
                    
            docs = []
            if k.government_id:
                docs.append({'id': 'gov', 'name': 'Government ID', 'type': 'government_id', 'url': k.government_id})
            if k.qualification:
                docs.append({'id': 'qual', 'name': 'Qualification Certificate', 'type': 'qualification', 'url': k.qualification})
            if k.photo:
                docs.append({'id': 'photo', 'name': 'Photo', 'type': 'photo', 'url': k.photo})
                
            data.append({
                'id': k.id,
                'status': k.status,
                'submitted_at': k.submitted_at.isoformat() if k.submitted_at else None,
                'reviewed_at': k.reviewed_at.isoformat() if k.reviewed_at else None,
                'review_note': k.review_note or '',
                'user': {
                    'id': k.user.id,
                    'name': f"{k.user.first_name} {k.user.last_name}".strip() or k.user.username,
                    'email': k.user.email
                },
                'data': {
                    'phone': k.user.phone or '',
                    'country': profile.country if profile else '',
                    'state': profile.state if profile else '',
                    'city': profile.city if profile else '',
                    'address': profile.address if profile else '',
                    'bio': profile.bio if profile else '',
                    'highest_education': profile.highest_education if profile else '',
                    'skills': skills,
                    'bank_name': profile.bank_name if profile else '',
                    'account_name': profile.account_name if profile else '',
                    'account_number': profile.account_number if profile else '',
                },
                'documents': docs
            })
            
        return Response({
            'data': data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })

class AdminKycDetailView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, kyc_id):
        k = get_object_or_404(KycSubmission, id=kyc_id)
        profile = getattr(k.user, 'profile', None)
        skills = profile.skills if profile else []
        if isinstance(skills, str):
            import json
            try:
                skills = json.loads(skills)
            except Exception:
                skills = []
                
        docs = []
        if k.government_id:
            docs.append({'id': 'gov', 'name': 'Government ID', 'type': 'government_id', 'url': k.government_id})
        if k.qualification:
            docs.append({'id': 'qual', 'name': 'Qualification Certificate', 'type': 'qualification', 'url': k.qualification})
        if k.photo:
            docs.append({'id': 'photo', 'name': 'Photo', 'type': 'photo', 'url': k.photo})
            
        return Response({
            'id': k.id,
            'status': k.status,
            'submitted_at': k.submitted_at.isoformat() if k.submitted_at else None,
            'reviewed_at': k.reviewed_at.isoformat() if k.reviewed_at else None,
            'review_note': k.review_note or '',
            'user': {
                'id': k.user.id,
                'name': f"{k.user.first_name} {k.user.last_name}".strip() or k.user.username,
                'email': k.user.email
            },
            'data': {
                'phone': k.user.phone or '',
                'country': profile.country if profile else '',
                'state': profile.state if profile else '',
                'city': profile.city if profile else '',
                'address': profile.address if profile else '',
                'bio': profile.bio if profile else '',
                'highest_education': profile.highest_education if profile else '',
                'skills': skills,
                'bank_name': profile.bank_name if profile else '',
                'account_name': profile.account_name if profile else '',
                'account_number': profile.account_number if profile else '',
            },
            'documents': docs
        })

class AdminKycApproveView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, kyc_id):
        k = get_object_or_404(KycSubmission, id=kyc_id)
        notes = request.data.get('notes', 'Approved.')
        
        from django.utils import timezone
        k.status = 'approved'
        k.reviewed_at = timezone.now()
        k.review_note = notes
        k.save()
        
        profile, _ = Profile.objects.get_or_create(user=k.user)
        profile.is_verified = True
        profile.save()
        
        return Response({'success': True})

class AdminKycRejectView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, kyc_id):
        k = get_object_or_404(KycSubmission, id=kyc_id)
        notes = request.data.get('notes')
        if not notes:
            return Response({'message': 'Notes are required for rejection'}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.utils import timezone
        k.status = 'rejected'
        k.reviewed_at = timezone.now()
        k.review_note = notes
        k.save()
        
        profile, _ = Profile.objects.get_or_create(user=k.user)
        profile.is_verified = False
        profile.save()
        
        return Response({'success': True})

class AdminAuditLogsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        action = request.query_params.get('action')
        action_prefix = request.query_params.get('action_prefix')
        actor_id = request.query_params.get('actor_id')
        auditable_type = request.query_params.get('auditable_type')
        auditable_id = request.query_params.get('auditable_id')
        request_id = request.query_params.get('request_id')

        queryset = AuditLog.objects.all().order_by('-created_at')

        if action:
            queryset = queryset.filter(action=action)
        if action_prefix:
            queryset = queryset.filter(action__startswith=action_prefix)
        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)
        if auditable_type:
            queryset = queryset.filter(auditable_type__icontains=auditable_type)
        if auditable_id:
            queryset = queryset.filter(auditable_id=auditable_id)
        if request_id:
            queryset = queryset.filter(request_id=request_id)

        per_page = int(request.query_params.get('per_page', 25))
        page = int(request.query_params.get('page', 1))

        total = queryset.count()
        start = (page - 1) * per_page
        end = start + per_page
        sliced = queryset[start:end]

        serializer = AuditLogSerializer(sliced, many=True)
        return Response({
            'data': serializer.data,
            'meta': {
                'total': total,
                'page': page,
                'per_page': per_page
            }
        })


class ResendEmailVerificationView(views.APIView):
    """
    POST /auth/email/verify/resend
    Generates a secure email verification token and sends the verification email.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        
        # Generate token using TimestampSigner
        from django.core.signing import TimestampSigner
        signer = TimestampSigner()
        signed_value = signer.sign(str(user.id))
        # The signed value is "user_id:timestamp:signature". We extract the "timestamp:signature" part as the hash
        token_hash = signed_value.split(':', 1)[1]
        
        # Build the frontend URL
        frontend_domain = request.headers.get('origin') or request.META.get('HTTP_ORIGIN') or 'https://integritas-xi.vercel.app'
        verification_link = f"{frontend_domain.rstrip('/')}/verify/{user.id}/{token_hash}"
        
        # Send email
        from django.core.mail import send_mail
        from django.conf import settings
        
        subject = "Verify Your Email Address - GGH Integritas"
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1a202c; text-align: center;">Verify your email address</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
                Thank you for joining GGH Integritas! Please confirm your email address by clicking the link below to verify your account:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #718096; font-size: 14px;">
                This link will expire in 24 hours. If you did not register for GGH Integritas, you can safely ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;" />
            <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                GGH Integritas Hub &copy; 2026
            </p>
        </div>
        """
        plain_message = f"Verify your email address by visiting this link: {verification_link}"
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False
            )
            return Response({'message': 'Verification email sent successfully.'})
        except Exception as e:
            return Response({'message': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailVerifyView(views.APIView):
    """
    GET /auth/email/verify/{id}/{hash}
    Verifies the email verification token and marks the email as verified.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id, token_hash):
        from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
        signer = TimestampSigner()
        
        # Reconstruct the signed value to verify: "user_id:token_hash"
        value_to_verify = f"{user_id}:{token_hash}"
        
        try:
            # Verify that it is valid and was signed within 24 hours (86400 seconds)
            signer.unsign(value_to_verify, max_age=86400)
        except (SignatureExpired, BadSignature):
            return Response({'message': 'The verification link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(id=user_id)
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.is_verified = True
            profile.save()
        except User.DoesNotExist:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({'message': 'Email verified successfully!'})






