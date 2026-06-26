from rest_framework import serializers
from .models import User, Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'bio', 'location', 'organisation', 'job_title',
            'linkedin_url', 'twitter_url', 'website_url',
            'avatar_url', 'is_verified'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    account_state = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()
    email_verified_at = serializers.SerializerMethodField()

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 
            'phone', 'profile', 'account_state', 'email_verified', 'email_verified_at'
        ]

    def get_role(self, obj):
        # Superusers automatically map as admin
        if obj.is_superuser:
            return 'admin'
        return obj.role

    def get_account_state(self, obj):
        # Always verified / active for local/Render testing bypass
        return 'active'

    def get_email_verified(self, obj):
        return True

    def get_email_verified_at(self, obj):
        from django.utils import timezone
        return timezone.now().isoformat()

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
