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
    Periodic task: check all active heartbeats and dispatch automated email reminders
    based on interval-scaled milestones (e.g. 7, 5, 3, 1 days for monthly).
    Also checks grace period countdowns (3 days, 1 day) to prevent accidental releases.
    Uses reminders_sent tracking on HeartbeatConfig to prevent duplicate email dispatch.
    """
    from heartbeat.models import HeartbeatConfig, HeartbeatLog
    from notifications.services import NotificationService
    from audit.services import AuditService

    now = timezone.now()
    count = 0

    # ── 1. ACTIVE HEARTBEAT MILESTONES ──
    active_configs = HeartbeatConfig.objects.filter(
        state='active',
        next_deadline__gt=now,
    ).select_related('owner')

    for config in active_configs:
        days_remaining = (config.next_deadline - now).total_seconds() / 86400.0
        milestones = config.reminder_milestones  # e.g., [7, 5, 3, 1] for 30d
        sent_milestones = set(config.reminders_sent or [])

        # Find milestones that are due but haven't had an email recorded in this cycle
        due_milestones = [
            m for m in sorted(milestones, reverse=True)
            if days_remaining <= m and m not in sent_milestones
        ]

        if due_milestones:
            # Pick the most urgent milestone to dispatch
            milestone_to_send = min(due_milestones)

            # Record all passed milestones to avoid back-triggering
            updated_sent = list(sent_milestones.union(due_milestones))
            config.reminders_sent = updated_sent
            config.save(update_fields=['reminders_sent'])

            if milestone_to_send == 1:
                title = "🚨 Final 24h Heartbeat Notice: Check-in due tomorrow"
                description = (
                    f"Your Dead Man's Switch check-in deadline is in less than 24 hours "
                    f"({config.next_deadline.strftime('%b %d, %Y at %H:%M UTC')}). "
                    f"Please check in now to prevent your vault from entering the grace period."
                )
            else:
                title = f"⏰ Dead Man's Switch Reminder: {milestone_to_send} days until check-in deadline"
                description = (
                    f"Your scheduled check-in is due in {milestone_to_send} days "
                    f"({config.next_deadline.strftime('%b %d, %Y at %H:%M UTC')}). "
                    f"Confirm you are active to keep your vault secure and reset your timer."
                )

            NotificationService.create(
                user=config.owner,
                notification_type='heartbeat',
                title=title,
                description=description,
                related_object_type='heartbeat_config',
                related_object_id=config.id,
            )

            HeartbeatLog.objects.create(
                config=config,
                event_type=HeartbeatLog.EventType.REMINDER,
                details=f"Milestone reminder dispatched: {milestone_to_send} days remaining before deadline.",
            )

            AuditService.log(
                user=config.owner,
                action_key='heartbeat_reminder_sent',
                action_title='Heartbeat Reminder Dispatched',
                details=f"Automated email reminder sent ({milestone_to_send} days remaining).",
                category='heartbeat',
            )

            count += 1

    # ── 2. GRACE PERIOD WARNING MILESTONES ──
    grace_configs = HeartbeatConfig.objects.filter(
        state='grace',
        grace_deadline__gt=now,
    ).select_related('owner')

    for config in grace_configs:
        grace_days_remaining = (config.grace_deadline - now).total_seconds() / 86400.0
        sent_milestones = set(config.reminders_sent or [])

        # Grace milestones (e.g. 3 days and 1 day remaining)
        grace_milestones = []
        if config.grace_period_days >= 5:
            grace_milestones = [3, 1]
        elif config.grace_period_days >= 2:
            grace_milestones = [1]

        due_grace = [
            gm for gm in sorted(grace_milestones, reverse=True)
            if grace_days_remaining <= gm and f"grace_{gm}" not in sent_milestones
        ]

        if due_grace:
            gm_to_send = min(due_grace)
            new_markers = {f"grace_{gm}" for gm in due_grace}
            updated_sent = list(sent_milestones.union(new_markers))
            config.reminders_sent = updated_sent
            config.save(update_fields=['reminders_sent'])

            if gm_to_send == 1:
                title = "🚨 URGENT: Only 24 Hours Left in Grace Period!"
                description = (
                    f"Your Dead Man's Switch deadline was missed. Your grace period expires tomorrow "
                    f"({config.grace_deadline.strftime('%b %d, %Y at %H:%M UTC')}). "
                    f"Check in immediately to cancel vault release to your trustees."
                )
            else:
                title = f"⚠️ Grace Period Active: {gm_to_send} days remaining before vault release"
                description = (
                    f"Your heartbeat check-in was missed. You have {gm_to_send} days left "
                    f"({config.grace_deadline.strftime('%b %d, %Y at %H:%M UTC')}) before automatic vault release."
                )

            NotificationService.create(
                user=config.owner,
                notification_type='heartbeat',
                title=title,
                description=description,
                related_object_type='heartbeat_config',
                related_object_id=config.id,
            )

            HeartbeatLog.objects.create(
                config=config,
                event_type=HeartbeatLog.EventType.GRACE_REMINDER,
                details=f"Grace warning dispatched: {gm_to_send} days remaining before release.",
            )

            AuditService.log(
                user=config.owner,
                action_key='grace_reminder_sent',
                action_title='Grace Warning Dispatched',
                details=f"Grace warning email sent ({gm_to_send} days remaining).",
                category='heartbeat',
                status='warning',
            )

            count += 1

    logger.info(f"Heartbeat reminder run complete: {count} emails dispatched.")
    return f"Dispatched {count} heartbeat/grace reminders"
