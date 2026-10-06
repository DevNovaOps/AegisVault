"""
AegisVault — Accounts Serializers
Authentication, registration, and user profile serialization.
Matches frontend auth.html form fields and localStorage user object shape.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializes user data.
    Frontend expects: { name, email, role }
    """
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'phone', 'avatar',
                  'is_email_verified', 'is_2fa_enabled', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class RegisterSerializer(serializers.Serializer):
    """
    Registration serializer.
    Frontend signup form sends: name, email, password, role
    Owner also sends: vault_name (optional)
    Trustee also sends: invite_code (optional)
    Admin also sends: admin_token (required)
    """
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=12, write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices, default='owner')

    # Role-specific optional fields
    vault_name = serializers.CharField(max_length=255, required=False, default='')
    invite_code = serializers.CharField(max_length=100, required=False, default='')
    admin_token = serializers.CharField(max_length=100, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate(self, attrs):
        role = attrs.get('role', 'owner')

        # Admin registration requires valid enrollment key
        if role == 'admin':
            token = attrs.get('admin_token', '')
            expected = getattr(settings, 'AEGIS_ADMIN_ENROLLMENT_KEY', '')
            if not expected or token != expected:
                raise serializers.ValidationError({
                    'admin_token': 'Invalid Admin Master Enrollment Key.'
                })

        return attrs

    def create(self, validated_data):
        # Remove non-model fields
        validated_data.pop('vault_name', None)
        validated_data.pop('invite_code', None)
        validated_data.pop('admin_token', None)

        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """
    Login serializer.
    Frontend signin form sends: email, password
    Admin also sends: clearance_token (AEGIS-ROOT-XXXX)
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=User.Role.choices, default='owner', required=False
    )
    clearance_token = serializers.CharField(required=False, default='')

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        role = attrs.get('role', 'owner')

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError({
                'detail': 'Invalid email or password.'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This account has been deactivated.'
            })

        # Superusers and existing users auto-align to their actual account role
        if user.is_superuser:
            role = 'admin'
            attrs['role'] = 'admin'
        elif role and user.role != role:
            role = user.role
            attrs['role'] = user.role

        # Admin clearance token check (validated if provided, superusers bypassed)
        if role == 'admin' and not user.is_superuser:
            clearance = attrs.get('clearance_token', '')
            expected = getattr(settings, 'AEGIS_ADMIN_CLEARANCE_TOKEN', '')
            if expected and clearance and clearance != expected:
                raise serializers.ValidationError({
                    'clearance_token': 'Invalid SecOps Root Clearance Token.'
                })

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Change password. Frontend profile-security.js sends current + new password."""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=12, write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Update profile. Frontend profile form sends name, phone, bio, timezone."""
    class Meta:
        model = User
        fields = ['name', 'phone', 'bio', 'timezone_preference', 'avatar']
