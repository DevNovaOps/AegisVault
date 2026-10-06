"""
AegisVault — Trustees App: Trustee profile, Invitation models
Matches frontend trustees.js and invitations.js mock data structures.
"""
import uuid
import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class TrusteeProfile(models.Model):
    """
    Extended trustee information linked to a User with role=trustee.
    Frontend fields: name, email, phone, relationship, vaults, verifStatus,
                     status, dateAdded, sharesHeld
    """

    class VerificationStatus(models.TextChoices):
        VERIFIED = 'Verified', 'Verified'
        PENDING = 'Pending', 'Pending'
        NOT_STARTED = 'Not Started', 'Not Started'
        REVOKED = 'Revoked', 'Revoked'

    class TrusteeStatus(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        INVITED = 'Invited', 'Invited'
        REMOVED = 'Removed', 'Removed'
        SUSPENDED = 'Suspended', 'Suspended'

    class Relationship(models.TextChoices):
        BROTHER = 'Brother', 'Brother'
        SISTER = 'Sister', 'Sister'
        SPOUSE = 'Spouse', 'Spouse'
        FRIEND = 'Friend', 'Friend'
        COLLEAGUE = 'Colleague', 'Colleague'
        COUSIN = 'Cousin', 'Cousin'
        LEGAL_ADVISOR = 'Legal Advisor', 'Legal Advisor'
        OTHER = 'Other', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trustee_profile',
        null=True, blank=True  # null until the trustee user registers/accepts
    )
    # The owner who designated this trustee
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='designated_trustees'
    )
    # Contact info (may differ from user account if not yet registered)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=30, blank=True, default='')

    relationship = models.CharField(
        max_length=30, choices=Relationship.choices, default=Relationship.OTHER
    )
    verification_status = models.CharField(
        max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.NOT_STARTED
    )
    status = models.CharField(
        max_length=20, choices=TrusteeStatus.choices, default=TrusteeStatus.INVITED
    )

    date_added = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_trustee_profiles'
        unique_together = ['owner', 'email']
        ordering = ['-date_added']
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.name} ({self.email}) for {self.owner.name}"

    @property
    def shares_held_display(self):
        """Count of active shares held by this trustee for this owner's vaults."""
        if not self.user:
            return 'Pending invitation acceptance'
        count = self.user.received_shares.filter(
            vault__owner=self.owner,
            status='active'
        ).count()
        if count == 0:
            return 'No active shards'
        shard_word = 'shard' if count == 1 else 'shards'
        return f'{count} encrypted {shard_word}'


class Invitation(models.Model):
    """
    Trustee invitation record.
    Frontend fields: name, email, rel, vault, status, sentDate, expiryDays, note
    """

    class InvitationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        EXPIRED = 'expired', 'Expired'
        REVOKED = 'revoked', 'Revoked'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    trustee_profile = models.ForeignKey(
        TrusteeProfile,
        on_delete=models.CASCADE,
        related_name='invitations',
        null=True, blank=True
    )

    # Invitee details
    invitee_name = models.CharField(max_length=255)
    invitee_email = models.EmailField(max_length=255)
    relationship = models.CharField(max_length=30, blank=True, default='')
    vault = models.ForeignKey(
        'vaults.Vault',
        on_delete=models.CASCADE,
        related_name='invitations'
    )

    status = models.CharField(
        max_length=10, choices=InvitationStatus.choices, default=InvitationStatus.PENDING
    )
    note = models.TextField(blank=True, default='')

    # Secure token for invitation acceptance
    token = models.CharField(max_length=128, unique=True, default='')
    token_used = models.BooleanField(default=False)

    # Timing
    sent_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    declined_at = models.DateTimeField(null=True, blank=True)
    decline_reason = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'aegis_invitations'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['invitee_email']),
            models.Index(fields=['token']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"Invitation to {self.invitee_name} for {self.vault.name} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(64)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(
                days=getattr(settings, 'AEGIS_INVITATION_EXPIRY_DAYS', 14)
            )
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at and self.status == 'pending'

    @property
    def expiry_days(self):
        if self.expires_at:
            delta = self.expires_at - timezone.now()
            return max(0, delta.days)
        return 0
