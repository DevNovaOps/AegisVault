"""
AegisVault — Vault Serializers
Matches frontend my-vaults.js and share-management.js data shapes.
"""
from rest_framework import serializers
from .models import Vault, VaultAsset, VaultShare


class VaultSerializer(serializers.ModelSerializer):
    """
    Full vault serializer.
    Frontend expects: id, name, desc, type, status, trustees, sharesRatio,
                      sharesPercent, date, time, releaseCondition, storageUsed
    """
    trustees_count = serializers.SerializerMethodField()
    shares_ratio = serializers.SerializerMethodField()
    shares_percent = serializers.SerializerMethodField()
    storage_used = serializers.CharField(source='storage_used_display', read_only=True)

    class Meta:
        model = Vault
        fields = [
            'id', 'name', 'description', 'vault_type', 'status',
            'purpose', 'priority', 'tags',
            'trustees_count', 'shares_ratio', 'shares_percent',
            'release_condition', 'inactivity_days',
            'required_shares', 'total_shares',
            'storage_used', 'encryption_algorithm',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_trustees_count(self, obj):
        return obj.shares.filter(status='active').values('trustee').distinct().count()

    def get_shares_ratio(self, obj):
        active = obj.shares.filter(status='active').count()
        total = obj.total_shares
        return f"{active} / {total}"

    def get_shares_percent(self, obj):
        active = obj.shares.filter(status='active').count()
        total = obj.total_shares
        return round((active / total) * 100) if total > 0 else 0


class VaultCreateSerializer(serializers.ModelSerializer):
    """Create a new vault. Frontend form sends: name, category, description."""

    class Meta:
        model = Vault
        fields = ['name', 'description', 'vault_type', 'release_condition',
                  'inactivity_days', 'required_shares', 'total_shares',
                  'purpose', 'priority', 'tags', 'status']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class VaultShareSerializer(serializers.ModelSerializer):
    """
    Share serializer.
    Frontend expects: vault, trusteeName, trusteeEmail, accessLevel, status,
                      sharedDate, sharedTime, expiresOn, note
    """
    vault_name = serializers.CharField(source='vault.name', read_only=True)
    vault_description = serializers.CharField(source='vault.description', read_only=True)
    trustee_name = serializers.CharField(source='trustee.name', read_only=True)
    trustee_email = serializers.CharField(source='trustee.email', read_only=True)

    class Meta:
        model = VaultShare
        fields = [
            'id', 'vault', 'vault_name', 'vault_description',
            'trustee', 'trustee_name', 'trustee_email',
            'access_level', 'status', 'note', 'expires_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VaultShareCreateSerializer(serializers.Serializer):
    """Create a new share. Frontend form sends vault, trustee, access_level, expiry, note."""
    vault_id = serializers.UUIDField()
    trustee_email = serializers.EmailField()
    access_level = serializers.ChoiceField(
        choices=VaultShare.AccessLevel.choices, default='View Only'
    )
    note = serializers.CharField(required=False, default='')
    expires_at = serializers.DateTimeField(required=False, allow_null=True, default=None)


class VaultAssetSerializer(serializers.ModelSerializer):
    """Vault asset serializer — never exposes decrypted content."""

    class Meta:
        model = VaultAsset
        fields = [
            'id', 'vault', 'name', 'category', 'sensitivity', 'description',
            'file_size_bytes', 'mime_type', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        # encrypted_data, encryption_iv, encryption_tag intentionally excluded
