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
    Admin also sends: admin_token (required for admin role)
    """
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices, default='owner')

    # Role-specific optional fields
    vault_name = serializers.CharField(max_length=255, required=False, default='')
    invite_code = serializers.CharField(max_length=100, required=False, default='')
    admin_token = serializers.CharField(max_length=100, required=False, default='')

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized

    def validate(self, attrs):
        role = attrs.get('role', 'owner')

        # Admin registration requires valid enrollment key
        if role == 'admin':
            token = attrs.get('admin_token', '').strip()
            expected = getattr(settings, 'AEGIS_ADMIN_ENROLLMENT_KEY', 'ROOT-SEC-8821')
            if not token or token != expected:
                raise serializers.ValidationError({
                    'admin_token': 'Invalid Admin Master Enrollment Key.'
                })

        return attrs

    def create(self, validated_data):
        vault_name = validated_data.pop('vault_name', None) or 'Primary Legacy Vault'
        invite_code = validated_data.pop('invite_code', None)
        validated_data.pop('admin_token', None)

        password = validated_data.pop('password')
        role = validated_data.get('role', 'owner')

        user = User.objects.create_user(password=password, **validated_data)

        # 1. Owner: Auto-initialize primary estate vault
        if user.role == User.Role.OWNER:
            try:
                from vaults.models import Vault
                Vault.objects.create(
                    owner=user,
                    name=vault_name,
                    description='Initial cryptographic legacy vault',
                    vault_type=Vault.VaultType.PERSONAL,
                    status=Vault.VaultStatus.ACTIVE
                )
            except Exception:
                pass

        # 2. Trustee: Auto-link existing invitations or create profile
        elif user.role == User.Role.TRUSTEE:
            try:
                from trustees.models import TrusteeProfile, Invitation
                from django.utils import timezone

                inv = None
                if invite_code:
                    inv = Invitation.objects.filter(token=invite_code).first()
                if not inv:
                    inv = Invitation.objects.filter(invitee_email__iexact=user.email, status='pending').first()

                if inv:
                    inv.status = Invitation.InvitationStatus.ACCEPTED
                    inv.token_used = True
                    inv.accepted_at = timezone.now()
                    inv.save()
                    if inv.trustee_profile:
                        inv.trustee_profile.user = user
                        inv.trustee_profile.status = TrusteeProfile.TrusteeStatus.ACTIVE
                        inv.trustee_profile.verification_status = TrusteeProfile.VerificationStatus.VERIFIED
                        inv.trustee_profile.save()
            except Exception:
                pass

        # 3. Admin: Grant staff status for backend platform access
        elif user.role == User.Role.ADMIN:
            user.is_staff = True
            user.save(update_fields=['is_staff'])

        return user


class LoginSerializer(serializers.Serializer):
    """
    Login serializer.
    Frontend signin form sends: email, password, role
    Admin also sends: clearance_token (AEGIS-ROOT-XXXX)
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=User.Role.choices, default='owner', required=False
    )
    clearance_token = serializers.CharField(required=False, default='')

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')
        role = attrs.get('role', 'owner')

        user = User.objects.filter(email__iexact=email).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError({
                'detail': 'Invalid email or password.'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This account has been deactivated.'
            })

        # Auto-align role with registered user status
        if user.is_superuser:
            role = 'admin'
            attrs['role'] = 'admin'
        elif role and user.role != role:
            role = user.role
            attrs['role'] = user.role

        # Admin clearance token check (superusers bypassed)
        if role == 'admin' and not user.is_superuser:
            clearance = attrs.get('clearance_token', '').strip()
            expected = getattr(settings, 'AEGIS_ADMIN_CLEARANCE_TOKEN', 'AEGIS-ROOT-9092')
            if expected and clearance and clearance != expected:
                raise serializers.ValidationError({
                    'clearance_token': 'Invalid SecOps Root Clearance Token.'
                })

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Change password. Frontend profile-security.js sends current + new password."""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)

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
