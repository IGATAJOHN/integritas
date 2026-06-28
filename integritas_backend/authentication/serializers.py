from rest_framework import serializers
from .models import User, Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'bio', 'location', 'organisation', 'job_title',
            'linkedin_url', 'twitter_url', 'website_url',
            'avatar_url', 'is_verified',
            'country', 'state', 'city', 'address',
            'highest_education', 'skills',
            'bank_name', 'account_name', 'account_number'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    account_state = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()
    email_verified_at = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    kyc_status = serializers.SerializerMethodField()
    is_foundational_tutor = serializers.SerializerMethodField()
    is_expert_tutor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 
            'phone', 'profile', 'account_state', 'email_verified', 'email_verified_at',
            'roles', 'permissions', 'kyc_status', 'is_foundational_tutor', 'is_expert_tutor'
        ]

    def get_role(self, obj):
        # Superusers automatically map as admin
        if obj.is_superuser:
            return 'admin'
        return obj.role

    def get_account_state(self, obj):
        if not obj.is_active:
            return 'suspended'
        return 'active'

    def get_email_verified(self, obj):
        return True

    def get_email_verified_at(self, obj):
        from django.utils import timezone
        return timezone.now().isoformat()

    def get_roles(self, obj):
        if obj.roles_list:
            return obj.roles_list
        result = []
        if obj.role:
            result.append(obj.role)
        if obj.is_superuser and 'admin' not in result:
            result.append('admin')
        return result

    def get_permissions(self, obj):
        if obj.permissions_list:
            return obj.permissions_list
        if obj.role in ['admin', 'super_admin', 'support'] or obj.is_superuser:
            return ['admins.manage', 'users.view', 'users.manage']
        return []

    def get_kyc_status(self, obj):
        latest = obj.kyc_submissions.order_by('-submitted_at').first()
        if latest:
            return latest.status
        return 'draft'

    def get_is_foundational_tutor(self, obj):
        return obj.role == 'tutor' and (obj.is_foundational or (hasattr(obj, 'profile') and obj.profile.is_verified))

    def get_is_expert_tutor(self, obj):
        return obj.role == 'tutor' and not (obj.is_foundational or (hasattr(obj, 'profile') and obj.profile.is_verified))


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'name', 'phone']
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True}
        }

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        first_name = ''
        last_name = ''
        if name:
            parts = name.strip().split(' ', 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]

        email = validated_data['email']
        username = validated_data.get('username') or email.split('@')[0]
        
        # Ensure username uniqueness
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get('phone', ''),
            role='learner'
        )
        # Create user profile automatically (marked as verified for dev testing)
        Profile.objects.create(user=user, is_verified=True)
        return user
