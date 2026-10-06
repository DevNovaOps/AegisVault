"""
AegisVault — Trustee Serializers
Matches frontend trustees.js and invitations.js data shapes.
"""
from rest_framework import serializers
from .models import TrusteeProfile, Invitation


class TrusteeProfileSerializer(serializers.ModelSerializer):
    """
    Frontend expects: id, name, email, phone, relationship, vaults,
                      vaultsCount, verifStatus, status, dateAdded, sharesHeld
    """
    vaults = serializers.SerializerMethodField()
    vaults_count = serializers.SerializerMethodField()
    shares_held = serializers.CharField(source='shares_held_display', read_only=True)
    owner_name = serializers.CharField(source='owner.name', read_only=True)

    class Meta:
        model = TrusteeProfile
        fields = [
            'id', 'name', 'email', 'phone', 'relationship',
            'verification_status', 'status',
            'vaults', 'vaults_count', 'shares_held',
            'owner_name', 'date_added', 'updated_at',
        ]
        read_only_fields = ['id', 'date_added', 'updated_at']

    def get_vaults(self, obj):
        """Return list of vault names this trustee has shares to."""
        if not obj.user:
            return []
        return list(
            obj.user.received_shares
            .filter(vault__owner=obj.owner, status='active')
            .values_list('vault__name', flat=True)
            .distinct()
        )

    def get_vaults_count(self, obj):
        return len(self.get_vaults(obj))


class TrusteeCreateSerializer(serializers.Serializer):
    """
    Create/invite a trustee.
    Frontend add-trustee form sends: name, email, relationship, vault (name)
    """
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    relationship = serializers.CharField(max_length=30, default='Other')
    vault_id = serializers.UUIDField()


class TrusteeEditSerializer(serializers.Serializer):
    """Edit trustee. Frontend edit form sends: name, email, relationship."""
    name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)
    relationship = serializers.CharField(max_length=30, required=False)


class InvitationSerializer(serializers.ModelSerializer):
    """
    Frontend expects: id, name, email, rel, vault, status, sentDate, sentTime,
                      expiryDays, note, acceptedDate, declineReason
    """
    vault_name = serializers.CharField(source='vault.name', read_only=True)
    expiry_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = Invitation
        fields = [
            'id', 'invitee_name', 'invitee_email', 'relationship',
            'vault', 'vault_name', 'status', 'note',
            'sent_at', 'expires_at', 'expiry_days',
            'accepted_at', 'declined_at', 'decline_reason',
        ]
        read_only_fields = ['id', 'sent_at', 'accepted_at', 'declined_at']


class InvitationCreateSerializer(serializers.Serializer):
    """
    Send new invitation.
    Frontend form sends: invitee_name, invitee_email, relationship, vault_id, note
    """
    invitee_name = serializers.CharField(max_length=255)
    invitee_email = serializers.EmailField()
    relationship = serializers.CharField(max_length=30, default='Other')
    vault_id = serializers.UUIDField()
    note = serializers.CharField(required=False, default='')
