"""
AegisVault — Notification Celery Tasks
"""
import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger('aegisvault')


@shared_task(name='notifications.tasks.cleanup_old_notifications')
def cleanup_old_notifications():
    """
    Periodic task: Delete notifications older than 90 days
    to keep the table size manageable.
    """
    from notifications.models import Notification

    cutoff = timezone.now() - timedelta(days=90)

    deleted_count, _ = Notification.objects.filter(
        created_at__lt=cutoff
    ).delete()

    logger.info(f"Cleaned up {deleted_count} old notifications")
    return f"Deleted {deleted_count} notifications"
