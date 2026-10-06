"""
AegisVault — Release Celery Tasks
Background processing for release workflows.
"""
import logging
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger('aegisvault')


@shared_task(name='releases.tasks.trigger_release_for_owner')
def trigger_release_for_owner(owner_id):
    """
    Trigger all pending/scheduled inactivity-based releases for an owner.
    Called when the Dead Man's Switch fires.
    """
    from releases.models import ReleaseRequest
    from notifications.services import NotificationService
    from audit.services import AuditService
    from accounts.models import User

    try:
        owner = User.objects.get(id=owner_id)
    except User.DoesNotExist:
        logger.error(f"Release trigger failed: owner {owner_id} not found")
        return

    releases = ReleaseRequest.objects.filter(
        owner=owner,
        trigger_type='Upon Inactivity',
        status__in=['pending', 'scheduled'],
    )

    count = 0
    for release in releases:
        release.status = 'in_progress'
        release.triggered_at = timezone.now()
        release.save()

        # Notify all participants
        for participant in release.participants.all():
            NotificationService.create(
                user=participant.trustee,
                notification_type='release',
                title=f'Share submission required: {release.title}',
                description=(
                    f'The Dead Man\'s Switch for {owner.name} has been triggered. '
                    f'Please submit your share shard for vault "{release.vault.name}".'
                ),
                vault_name=release.vault.name,
            )

        AuditService.log(
            user=owner,
            action_key='release_triggered',
            action_title='Release Triggered',
            details=f'Release "{release.title}" triggered via Dead Man\'s Switch',
            category='release',
            vault_name=release.vault.name,
            status='warning',
        )

        count += 1

    logger.info(f"Triggered {count} releases for owner {owner.email}")
    return f"Triggered {count} releases for {owner.email}"


@shared_task(name='releases.tasks.process_pending_releases')
def process_pending_releases():
    """
    Periodic task: check scheduled releases whose date has arrived.
    """
    from releases.models import ReleaseRequest
    from notifications.services import NotificationService

    now = timezone.now()

    scheduled = ReleaseRequest.objects.filter(
        trigger_type='Scheduled Date',
        status='scheduled',
        scheduled_at__lte=now,
    )

    count = 0
    for release in scheduled:
        release.status = 'in_progress'
        release.triggered_at = now
        release.save()

        for participant in release.participants.all():
            NotificationService.create(
                user=participant.trustee,
                notification_type='release',
                title=f'Scheduled release: {release.title}',
                description=f'Release "{release.title}" has been activated on schedule.',
                vault_name=release.vault.name,
            )

        count += 1

    logger.info(f"Processed {count} scheduled releases")
    return f"Processed {count} scheduled releases"
