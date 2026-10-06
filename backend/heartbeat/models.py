"""
AegisVault — Heartbeat App: Dead Man's Switch models
Implements the server-side heartbeat state machine:
  ACTIVE → HEARTBEAT_MISSED → GRACE_PERIOD → GRACE_EXPIRED → TRIGGERED
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class HeartbeatConfig(models.Model):
    """
    Per-owner heartbeat configuration.
    Frontend fields: intervalDays, gracePeriodDays, lastPing, nextDeadline
    """

    class SwitchState(models.TextChoices):
        ACTIVE = 'active', 'Active'
        GRACE = 'grace', 'Grace Period'
        TRIGGERED = 'triggered', 'Triggered'
        RELEASED = 'released', 'Released'
        CANCELLED = 'cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='heartbeat_config'
    )

    interval_days = models.PositiveIntegerField(default=30)
    grace_period_days = models.PositiveIntegerField(default=7)
    state = models.CharField(
        max_length=15, choices=SwitchState.choices, default=SwitchState.ACTIVE
    )

    last_checkin = models.DateTimeField(default=timezone.now)
    next_deadline = models.DateTimeField()
    grace_deadline = models.DateTimeField(null=True, blank=True)

    # History tracking
    total_checkins = models.PositiveIntegerField(default=0)
    missed_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aegis_heartbeat_config'

    def __str__(self):
        return f"Heartbeat for {self.owner.name} ({self.state})"

    def save(self, *args, **kwargs):
        if not self.next_deadline:
            self.next_deadline = timezone.now() + timedelta(days=self.interval_days)
        super().save(*args, **kwargs)

    def checkin(self):
        """Process an 'I'm Alive' check-in. Resets the dead man's switch."""
        now = timezone.now()
        self.last_checkin = now
        self.next_deadline = now + timedelta(days=self.interval_days)
        self.grace_deadline = None
        self.state = self.SwitchState.ACTIVE
        self.total_checkins += 1
        self.save()

    def enter_grace_period(self):
        """Transition to grace period after missed heartbeat."""
        if self.state != self.SwitchState.ACTIVE:
            return False
        self.state = self.SwitchState.GRACE
        self.grace_deadline = timezone.now() + timedelta(days=self.grace_period_days)
        self.missed_count += 1
        self.save()
        return True

    def trigger_release(self):
        """Transition to triggered state after grace period expires."""
        if self.state != self.SwitchState.GRACE:
            return False
        self.state = self.SwitchState.TRIGGERED
        self.save()
        return True

    @property
    def is_overdue(self):
        return timezone.now() > self.next_deadline

    @property
    def remaining_seconds(self):
        delta = self.next_deadline - timezone.now()
        return max(0, int(delta.total_seconds()))


class HeartbeatLog(models.Model):
    """Immutable log of all heartbeat events."""

    class EventType(models.TextChoices):
        CHECKIN = 'checkin', 'Check-in'
        MISSED = 'missed', 'Missed'
        GRACE_STARTED = 'grace_started', 'Grace Period Started'
        GRACE_EXPIRED = 'grace_expired', 'Grace Period Expired'
        TRIGGERED = 'triggered', 'Release Triggered'
        CONFIG_CHANGED = 'config_changed', 'Configuration Changed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    config = models.ForeignKey(
        HeartbeatConfig, on_delete=models.CASCADE, related_name='logs'
    )
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    details = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'aegis_heartbeat_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event_type} at {self.timestamp}"
