"""
AegisVault — Heartbeat Celery Tasks
Background processing for Dead Man's Switch state machine.
These tasks run WITHOUT the frontend being open.
"""
import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger('aegisvault')


@shared_task(name='heartbeat.tasks.check_all_heartbeats')
def check_all_heartbeats():
    """
    Periodic task: check all active heartbeats for missed deadlines.
    Transitions ACTIVE → GRACE if deadline passed.
    """
    from heartbeat.models import HeartbeatConfig, HeartbeatLog
    from notifications.services import NotificationService
    from audit.services import AuditService

    now = timezone.now()
    overdue_configs = HeartbeatConfig.objects.filter(
        state='active',
        next_deadline__lt=now,
    )

    count = 0
    for config in overdue_configs:
        config.enter_grace_period()

        HeartbeatLog.objects.create(
            config=config,
            event_type='missed',
            details=f'Heartbeat deadline missed. Grace period started ({config.grace_period_days} days).',
        )

        HeartbeatLog.objects.create(
            config=config,
            event_type='grace_started',
            details=f'Grace period ends at {config.grace_deadline.isoformat()}',
        )

        NotificationService.create(
            user=config.owner,
            notification_type='heartbeat',
            title='⚠ Heartbeat Missed — Grace Period Active',
            description=(
                f'Your heartbeat deadline has passed. Grace period of '
                f'{config.grace_period_days} days is now active. '
                f'Check in immediately to prevent vault release.'
            ),
        )

        AuditService.log(
            user=config.owner,
            action_key='heartbeat_missed',
            action_title='Heartbeat Missed',
            details=f'Owner {config.owner.name} missed heartbeat. Grace period activated.',
            category='heartbeat',
            status='warning',
        )

        count += 1

    logger.info(f"Heartbeat check complete: {count} heartbeats entered grace period")
    return f"Processed {count} overdue heartbeats"


@shared_task(name='heartbeat.tasks.process_grace_periods')
def process_grace_periods():
    """
    Periodic task: check all configs in grace period.
    If grace deadline has passed → TRIGGERED → initiate release.
    """
    from heartbeat.models import HeartbeatConfig, HeartbeatLog
    from releases.tasks import trigger_release_for_owner
    from notifications.services import NotificationService
    from audit.services import AuditService

    now = timezone.now()
    expired_grace = HeartbeatConfig.objects.filter(
        state='grace',
        grace_deadline__lt=now,
    )

    count = 0
    for config in expired_grace:
        config.trigger_release()

        HeartbeatLog.objects.create(
            config=config,
            event_type='grace_expired',
            details='Grace period expired. Release triggered.',
        )

        HeartbeatLog.objects.create(
            config=config,
            event_type='triggered',
            details='Dead Man\'s Switch activated. Vault release initiated.',
        )

        NotificationService.create(
            user=config.owner,
            notification_type='release',
            title='🚨 Dead Man\'s Switch Triggered',
            description='Grace period has expired. Vault release process has been initiated.',
        )

        AuditService.log(
            user=config.owner,
            action_key='dms_triggered',
            action_title='Dead Man\'s Switch Triggered',
            details=f'Grace period expired for {config.owner.name}. Release initiated.',
            category='heartbeat',
            status='warning',
        )

        # Trigger release workflow asynchronously
        trigger_release_for_owner.delay(str(config.owner.id))

        count += 1

    logger.info(f"Grace period check: {count} owners triggered for release")
    return f"Triggered {count} releases"


@shared_task(name='heartbeat.tasks.send_heartbeat_reminders')
def send_heartbeat_reminders():
    """
    Daily task: send reminders to owners whose heartbeat deadline is within 3 days.
    """
    from heartbeat.models import HeartbeatConfig
    from notifications.services import NotificationService
    from datetime import timedelta

    now = timezone.now()
    warning_threshold = now + timedelta(days=3)

    upcoming = HeartbeatConfig.objects.filter(
        state='active',
        next_deadline__lte=warning_threshold,
        next_deadline__gt=now,
    )

    count = 0
    for config in upcoming:
        remaining_days = (config.next_deadline - now).days

        NotificationService.create(
            user=config.owner,
            notification_type='heartbeat',
            title=f'Heartbeat reminder: {remaining_days} day(s) remaining',
            description=(
                f'Your heartbeat check-in is due in {remaining_days} day(s). '
                f'Please confirm you are alive to prevent vault release.'
            ),
        )
        count += 1

    logger.info(f"Sent {count} heartbeat reminders")
    return f"Sent {count} reminders"
