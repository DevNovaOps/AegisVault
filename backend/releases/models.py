"""
AegisVault — Releases App: ReleaseRequest, ReleaseParticipant, SecretShare models
Implements the K-of-N release workflow with server-side state machine.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class ReleaseRequest(models.Model):
    """
    A release request tied to a vault.
    State machine: PENDING → IN_PROGRESS → AUTHORIZED → RELEASED
                   PENDING → CANCELLED
                   PENDING → EXPIRED
    Frontend fields: title, subtext, vault, recipientName, trigger, status,
                     scheduledDate, note
    """

    class ReleaseStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        AUTHORIZED = 'authorized', 'Authorized'
        RELEASED = 'released', 'Released'
        CANCELLED = 'cancelled', 'Cancelled'
        EXPIRED = 'expired', 'Expired'
        SCHEDULED = 'scheduled', 'Scheduled'

    class TriggerType(models.TextChoices):
        INACTIVITY = 'Upon Inactivity', 'Upon Inactivity'
        MANUAL = 'Manual Trigger', 'Manual Trigger'
        SCHEDULED_DATE = 'Scheduled Date', 'Scheduled Date'
        DEATH_CERT = 'Death Certificate', 'Death Certificate'
        TRUSTEE_CONSENSUS = 'Trustee Consensus', 'Trustee Consensus'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vault = models.ForeignKey(
        'vaults.Vault', on_delete=models.CASCADE, related_name='releases'
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='release_requests'
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    trigger_type = models.CharField(
        max_length=30, choices=TriggerType.choices, default=TriggerType.INACTIVITY
    )
    trigger_detail = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(
        max_length=20, choices=ReleaseStatus.choices, default=ReleaseStatus.PENDING
    )
    note = models.TextField(blank=True, default='')

    # K-of-N threshold for this release
    required_shares = models.PositiveIntegerField(default=1)
    total_shares = models.PositiveIntegerField(default=1)
    collected_shares = models.PositiveIntegerField(default=0)

    # Scheduling
    scheduled_at = models.DateTimeField(null=True, blank=True)
    triggered_at = models.DateTimeField(null=True, blank=True)
    authorized_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_release_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['vault', 'status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.vault.name} ({self.status})"

    def cancel(self):
        """Cancel this release. Only allowed from pending/in_progress/scheduled."""
        if self.status not in ('pending', 'in_progress', 'scheduled'):
            return False
        self.status = self.ReleaseStatus.CANCELLED
        self.cancelled_at = timezone.now()
        self.save()
        return True

    def check_threshold(self):
        """Check if K-of-N threshold is met and authorize if so."""
        if self.collected_shares >= self.required_shares:
            self.status = self.ReleaseStatus.AUTHORIZED
            self.authorized_at = timezone.now()
            self.save()
            return True
        return False


class ReleaseParticipant(models.Model):
    """
    A trustee participating in a release.
    Tracks whether the trustee has submitted their share.
    """

    class ParticipantStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUBMITTED = 'submitted', 'Submitted'
        VERIFIED = 'verified', 'Verified'
        DECLINED = 'declined', 'Declined'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    release = models.ForeignKey(
        ReleaseRequest, on_delete=models.CASCADE, related_name='participants'
    )
    trustee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='release_participations'
    )
    status = models.CharField(
        max_length=10, choices=ParticipantStatus.choices, default=ParticipantStatus.PENDING
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'aegis_release_participants'
        unique_together = ['release', 'trustee']

    def __str__(self):
        return f"{self.trustee.name} → {self.release.title} ({self.status})"


class SecretShare(models.Model):
    """
    A Shamir secret share shard.
    Stores the encrypted shard — NEVER the plaintext key material.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vault = models.ForeignKey(
        'vaults.Vault', on_delete=models.CASCADE, related_name='secret_shares'
    )
    trustee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='held_shares'
    )
    # The shard is stored encrypted (encrypted with the trustee's key)
    encrypted_shard = models.TextField()
    shard_index = models.PositiveIntegerField()  # Share index in Shamir scheme
    shard_metadata = models.JSONField(default=dict, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_secret_shares'
        unique_together = ['vault', 'trustee']
        ordering = ['shard_index']

    def __str__(self):
        return f"Shard #{self.shard_index} for {self.vault.name} → {self.trustee.name}"
