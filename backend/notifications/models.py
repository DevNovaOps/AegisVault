"""
AegisVault — Notifications App: Notification, NotificationPreference models
Matches frontend notifications.js mock data structure.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Notification(models.Model):
    """
    In-app notification record.
    Frontend fields: id, type, title, desc, vault, date, time, status, rawDate
    """

    class NotificationType(models.TextChoices):
        INVITATION = 'invitation', 'Invitation'
        TRUSTEE = 'trustee', 'Trustee'
        HEARTBEAT = 'heartbeat', 'Heartbeat'
        RELEASE = 'release', 'Release'
        SECURITY = 'security', 'Security'
        SYSTEM = 'system', 'System'
        SHARE = 'share', 'Share'

    class NotificationStatus(models.TextChoices):
        UNREAD = 'unread', 'Unread'
        READ = 'read', 'Read'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=15, choices=NotificationType.choices, default=NotificationType.SYSTEM
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    vault_name = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(
        max_length=10, choices=NotificationStatus.choices, default=NotificationStatus.UNREAD
    )
    # Optional link to related object
    related_object_type = models.CharField(max_length=50, blank=True, default='')
    related_object_id = models.UUIDField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'aegis_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} → {self.user.name}"


class NotificationPreference(models.Model):
    """
    Per-user notification preferences.
    Frontend notification preferences panel controls these.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )

    # Channel toggles
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)

    # Type toggles
    invitation_alerts = models.BooleanField(default=True)
    trustee_alerts = models.BooleanField(default=True)
    heartbeat_alerts = models.BooleanField(default=True)
    release_alerts = models.BooleanField(default=True)
    security_alerts = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_notification_preferences'

    def __str__(self):
        return f"Notification prefs for {self.user.name}"
