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


@shared_task(name='notifications.tasks.send_notification_email_async')
def send_notification_email_async(notification_id):
    """
    Asynchronous Celery task: dispatches real transactional email for a notification.
    """
    from notifications.models import Notification
    from notifications.email_service import NotificationEmailService

    try:
        notification = Notification.objects.select_related('user').get(id=notification_id)
        success, msg = NotificationEmailService.send_notification_email(notification)
        return {"success": success, "message": msg}
    except Notification.DoesNotExist:
        logger.warning(f"Notification ID {notification_id} not found for email dispatch")
        return {"success": False, "message": "Notification not found"}
    except Exception as e:
        logger.error(f"Error executing send_notification_email_async for {notification_id}: {e}", exc_info=True)
        return {"success": False, "message": str(e)}
