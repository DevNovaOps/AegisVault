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
        fields = ['id', 'name', 'email', 'role', 'phone', 'avatar', 'bio',
                  'timezone_preference', 'is_email_verified', 'is_2fa_enabled',
                  'date_joined', 'last_login']
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

        # Admin accounts cannot be created via public registration
        if role == 'admin':
            raise serializers.ValidationError({
                'role': 'Administrator accounts cannot be created publicly. Administrators must be provisioned via Django superuser management.'
            })

        # Trustee registration strictly requires an active, valid invitation from a Vault Owner
        if role == 'trustee':
            invite_code = attrs.get('invite_code', '').strip()
            if not invite_code:
                raise serializers.ValidationError({
                    'invite_code': 'A valid Trustee Invitation Code or Invitation ID is required to register as a Trustee.'
                })

            email = attrs.get('email', '').strip().lower()
            from trustees.models import Invitation
            import uuid

            # Search by token or invitation UUID
            invitation = Invitation.objects.filter(token=invite_code).first()

            if not invitation:
                try:
                    uuid_val = uuid.UUID(invite_code)
                    invitation = Invitation.objects.filter(id=uuid_val).first()
                except (ValueError, TypeError, AttributeError):
                    pass

            if not invitation:
                raise serializers.ValidationError({
                    'invite_code': 'Invalid Invitation Code. No active trustee invitation was found for this code or ID. You must receive an invitation from a Vault Owner to register.'
                })

            # Check invitation status
            if invitation.status == Invitation.InvitationStatus.ACCEPTED:
                raise serializers.ValidationError({
                    'invite_code': 'This invitation code has already been used and accepted.'
                })
            elif invitation.status == Invitation.InvitationStatus.DECLINED:
                raise serializers.ValidationError({
                    'invite_code': 'This invitation was previously declined.'
                })
            elif invitation.status == Invitation.InvitationStatus.REVOKED:
                raise serializers.ValidationError({
                    'invite_code': 'This invitation has been revoked by the vault owner.'
                })
            elif invitation.is_expired:
                invitation.status = Invitation.InvitationStatus.EXPIRED
                invitation.save(update_fields=['status'])
                raise serializers.ValidationError({
                    'invite_code': 'This invitation has expired. Please request a renewed invitation from the vault owner.'
                })

            # Ensure registering email matches invited email
            if invitation.invitee_email.strip().lower() != email:
                raise serializers.ValidationError({
                    'email': f"This invitation code was issued specifically to '{invitation.invitee_email}'. Please register using that email address."
                })

            attrs['_validated_invitation'] = invitation
            self._validated_invitation = invitation

        return attrs

    def create(self, validated_data):
        vault_name = validated_data.pop('vault_name', None) or 'Primary Legacy Vault'
        invite_code = validated_data.pop('invite_code', None)
        validated_invitation = validated_data.pop('_validated_invitation', None) or getattr(self, '_validated_invitation', None)
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

        # 2. Trustee: Auto-link existing invitations and create vault shares
        elif user.role == User.Role.TRUSTEE:
            try:
                from trustees.models import TrusteeProfile, Invitation
                from vaults.models import VaultShare
                from django.utils import timezone

                # Link any existing unlinked TrusteeProfiles for this email
                TrusteeProfile.objects.filter(email__iexact=user.email, user__isnull=True).update(user=user)

                invitations = []
                if validated_invitation:
                    invitations.append(validated_invitation)
                elif invite_code:
                    inv_by_code = Invitation.objects.filter(token=invite_code).first()
                    if not inv_by_code:
                        try:
                            import uuid
                            inv_by_code = Invitation.objects.filter(id=uuid.UUID(invite_code)).first()
                        except Exception:
                            pass
                    if inv_by_code:
                        invitations.append(inv_by_code)

                # Also find all pending invitations for this email
                pending_invs = Invitation.objects.filter(invitee_email__iexact=user.email, status='pending')
                for pi in pending_invs:
                    if pi not in invitations:
                        invitations.append(pi)

                for inv in invitations:
                    inv.status = Invitation.InvitationStatus.ACCEPTED
                    inv.token_used = True
                    inv.accepted_at = timezone.now()
                    inv.save()
                    if inv.trustee_profile:
                        inv.trustee_profile.user = user
                        inv.trustee_profile.status = TrusteeProfile.TrusteeStatus.ACTIVE
                        inv.trustee_profile.verification_status = TrusteeProfile.VerificationStatus.VERIFIED
                        inv.trustee_profile.save()

                    # Create VaultShare so trustee immediately sees the vault
                    VaultShare.objects.get_or_create(
                        vault=inv.vault,
                        trustee=user,
                        defaults={
                            'access_level': 'View Only',
                            'status': 'active',
                        }
                    )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error linking trustee user {user.email}: {e}")

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

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Change password. Supports both current_password and old_password field names."""
    current_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    old_password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        pwd = attrs.get('current_password') or attrs.get('old_password')
        if not pwd:
            raise serializers.ValidationError({'current_password': 'Current password is required.'})
        user = self.context['request'].user
        if not user.check_password(pwd):
            raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})
        return attrs


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Update profile. Frontend profile form sends name, email, phone, bio, timezone."""
    email = serializers.EmailField(required=False)

    class Meta:
        model = User
        fields = ['name', 'email', 'phone', 'bio', 'timezone_preference', 'avatar']

    def validate_email(self, value):
        if value:
            norm = value.strip().lower()
            user = self.instance
            if User.objects.filter(email__iexact=norm).exclude(pk=user.pk).exists():
                raise serializers.ValidationError('Email already in use by another account.')
            return norm
        return value
