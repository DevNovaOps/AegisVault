"""
AegisVault — Vaults App: Vault, VaultItem, VaultShare models
Matches frontend mock data structure from my-vaults.js and share-management.js
"""
import uuid
from django.db import models
from django.conf import settings


class Vault(models.Model):
    """
    A digital legacy vault owned by an OWNER user.
    Frontend fields: id, name, desc, type, status, trustees, sharesRatio,
                     sharesPercent, date, time, releaseCondition, storageUsed
    """

    class VaultType(models.TextChoices):
        PERSONAL = 'Personal', 'Personal'
        FAMILY = 'Family', 'Family'
        BUSINESS = 'Business', 'Business'
        LEGACY = 'Legacy', 'Legacy'
        HEALTH = 'Health', 'Health'

    class VaultStatus(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        DRAFT = 'Draft', 'Draft'
        LOCKED = 'Locked', 'Locked'
        ARCHIVED = 'Archived', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vaults',
        limit_choices_to={'role': 'owner'}
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    vault_type = models.CharField(
        max_length=20, choices=VaultType.choices, default=VaultType.PERSONAL
    )
    status = models.CharField(
        max_length=20, choices=VaultStatus.choices, default=VaultStatus.ACTIVE
    )

    # Release configuration
    release_condition = models.TextField(blank=True, default='')
    inactivity_days = models.PositiveIntegerField(default=60)
    required_shares = models.PositiveIntegerField(default=1)  # K in K-of-N
    total_shares = models.PositiveIntegerField(default=1)     # N in K-of-N

    # Encrypted storage metadata (vault contents are encrypted; we store metadata)
    storage_used_bytes = models.BigIntegerField(default=0)
    encryption_algorithm = models.CharField(max_length=50, default='AES-256-GCM')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_vaults'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['vault_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.owner.name})"

    @property
    def storage_used_display(self):
        """Human-readable storage size."""
        b = self.storage_used_bytes
        if b < 1024:
            return f"{b} B"
        elif b < 1024 ** 2:
            return f"{b / 1024:.0f} KB"
        elif b < 1024 ** 3:
            return f"{b / (1024 ** 2):.0f} MB"
        return f"{b / (1024 ** 3):.1f} GB"


class VaultItem(models.Model):
    """
    An encrypted item stored inside a vault.
    The backend stores encrypted payloads — never plaintext secrets.
    """

    class ItemCategory(models.TextChoices):
        DOCUMENT = 'document', 'Document'
        CREDENTIAL = 'credential', 'Credential'
        FINANCIAL = 'financial', 'Financial'
        PERSONAL = 'personal', 'Personal'
        RECOVERY = 'recovery', 'Recovery'
        CUSTOM = 'custom', 'Custom'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vault = models.ForeignKey(Vault, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    category = models.CharField(
        max_length=20, choices=ItemCategory.choices, default=ItemCategory.DOCUMENT
    )
    # Encrypted content — stored as base64-encoded ciphertext
    encrypted_data = models.TextField()
    # Encryption metadata needed for decryption (IV/nonce, not the key)
    encryption_iv = models.CharField(max_length=64, blank=True, default='')
    encryption_tag = models.CharField(max_length=64, blank=True, default='')

    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_vault_items'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} in {self.vault.name}"


class VaultShare(models.Model):
    """
    A sharing record between a vault and a trustee.
    Matches frontend share-management.js mock data fields.
    Frontend fields: vault, trusteeName, trusteeEmail, accessLevel, status,
                     sharedDate, expiresOn, note
    """

    class AccessLevel(models.TextChoices):
        VIEW_ONLY = 'View Only', 'View Only'
        VIEW_DOWNLOAD = 'View & Download', 'View & Download'
        FULL_ACCESS = 'Full Access', 'Full Access'

    class ShareStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PENDING = 'pending', 'Pending'
        REVOKED = 'revoked', 'Revoked'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vault = models.ForeignKey(Vault, on_delete=models.CASCADE, related_name='shares')
    trustee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_shares'
    )
    access_level = models.CharField(
        max_length=20, choices=AccessLevel.choices, default=AccessLevel.VIEW_ONLY
    )
    status = models.CharField(
        max_length=10, choices=ShareStatus.choices, default=ShareStatus.PENDING
    )
    note = models.TextField(blank=True, default='')
    expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_vault_shares'
        unique_together = ['vault', 'trustee']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.vault.name} → {self.trustee.name} ({self.access_level})"
