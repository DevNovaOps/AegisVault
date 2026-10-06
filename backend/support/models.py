"""
AegisVault — Support App: SupportTicket model
Matches frontend help-support.js ticket form.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class SupportTicket(models.Model):
    """Support ticket created from the Help & Support page."""

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    class TicketStatus(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    class TicketCategory(models.TextChoices):
        TECHNICAL = 'technical', 'Technical Issue'
        ACCOUNT = 'account', 'Account Issue'
        SECURITY = 'security', 'Security Concern'
        BILLING = 'billing', 'Billing'
        FEATURE = 'feature', 'Feature Request'
        OTHER = 'other', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_tickets'
    )
    subject = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=15, choices=TicketCategory.choices, default=TicketCategory.OTHER
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=15, choices=TicketStatus.choices, default=TicketStatus.OPEN
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_tickets'
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'aegis_support_tickets'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.priority}] {self.subject} ({self.status})"
