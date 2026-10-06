"""
AegisVault — Audit App: AuditLog, SecurityEvent models
Matches frontend activity-history.js and admin security operations data.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class AuditLog(models.Model):
    """
    Immutable audit log entry.
    Frontend fields: date, time, actionKey, actionTitle, details, vault,
                     category, user, email, ip, status
    """

    class Category(models.TextChoices):
        AUTH = 'auth', 'Authentication'
        VAULT = 'vault', 'Vault'
        TRUSTEE = 'trustee', 'Trustee'
        SHARE = 'share', 'Share'
        RELEASE = 'release', 'Release'
        HEARTBEAT = 'heartbeat', 'Heartbeat'
        SECURITY = 'security', 'Security'
        ADMIN = 'admin', 'Admin'
        PROFILE = 'profile', 'Profile'
        SYSTEM = 'system', 'System'

    class EventStatus(models.TextChoices):
        SUCCESS = 'success', 'Success'
        FAILURE = 'failure', 'Failure'
        WARNING = 'warning', 'Warning'
        INFO = 'info', 'Info'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='audit_logs'
    )
    action_key = models.CharField(max_length=50)
    action_title = models.CharField(max_length=255)
    details = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=15, choices=Category.choices, default=Category.SYSTEM
    )
    vault_name = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(
        max_length=10, choices=EventStatus.choices, default=EventStatus.SUCCESS
    )

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')

    # Tamper-evidence: hash of the previous log entry
    previous_hash = models.CharField(max_length=128, blank=True, default='')
    entry_hash = models.CharField(max_length=128, blank=True, default='')

    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'aegis_audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'category']),
            models.Index(fields=['action_key']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['category', 'status']),
        ]

    def __str__(self):
        user_str = self.user.name if self.user else 'System'
        return f"[{self.category}] {self.action_title} by {user_str}"


class SecurityEvent(models.Model):
    """
    Security-specific events for admin monitoring.
    Used by Admin Security Operations panel.
    """

    class Severity(models.TextChoices):
        CRITICAL = 'critical', 'Critical'
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'
        INFO = 'info', 'Info'

    class EventType(models.TextChoices):
        FAILED_LOGIN = 'failed_login', 'Failed Login'
        BRUTE_FORCE = 'brute_force', 'Brute Force Attempt'
        UNAUTHORIZED_ACCESS = 'unauthorized_access', 'Unauthorized Access'
        SUSPICIOUS_ACTIVITY = 'suspicious_activity', 'Suspicious Activity'
        CONFIG_CHANGE = 'config_change', 'Configuration Change'
        DATA_EXPORT = 'data_export', 'Data Export'
        RATE_LIMIT = 'rate_limit', 'Rate Limit Exceeded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='security_events'
    )
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    severity = models.CharField(
        max_length=10, choices=Severity.choices, default=Severity.MEDIUM
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    source_ip = models.GenericIPAddressField(null=True, blank=True)
    resource = models.CharField(max_length=255, blank=True, default='')

    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='resolved_events'
    )

    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'aegis_security_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type', 'severity']),
            models.Index(fields=['is_resolved']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"[{self.severity}] {self.title}"
