"""
AegisVault — Notification Service
Internal service for creating and routing notifications.
"""
import logging
from django.utils import timezone
from .models import Notification, NotificationPreference

logger = logging.getLogger('aegisvault')


class NotificationService:
    """Service for sending notifications to users."""

    @staticmethod
    def create(user, notification_type, title, description='', vault_name='',
               related_object_type='', related_object_id=None):
        """
        Create a notification, respecting user preferences.
        Returns the created notification or None if disabled by preference.
        """
        prefs, _ = NotificationPreference.objects.get_or_create(user=user)

        # Check type preferences
        pref_map = {
            'invitation': prefs.invitation_alerts,
            'trustee': prefs.trustee_alerts,
            'heartbeat': prefs.heartbeat_alerts,
            'release': prefs.release_alerts,
            'security': prefs.security_alerts,
            'system': prefs.system_alerts,
            'share': prefs.trustee_alerts,  # Map share to trustee_alerts
        }

        enabled = pref_map.get(notification_type, True)

        if not enabled:
            return None

        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            description=description,
            vault_name=vault_name,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
        )

        safe_title = title.encode('ascii', 'replace').decode('ascii')
        logger.info(f"Notification created for {user.email}: [{notification_type}] {safe_title}")

        # Real email dispatch (respecting user preference and email presence)
        if prefs.email_enabled and getattr(user, 'email', None):
            NotificationService._dispatch_email(notification)

        return notification

    @staticmethod
    def _is_redis_available():
        """Fast check to verify if Redis broker is reachable before queuing."""
        try:
            import redis
            from django.conf import settings
            broker_url = getattr(settings, 'CELERY_BROKER_URL', 'redis://127.0.0.1:6379/1')
            r = redis.from_url(broker_url, socket_connect_timeout=0.25)
            return bool(r.ping())
        except Exception:
            return False

    @classmethod
    def _dispatch_email(cls, notification):
        """
        Dispatches email via Celery async queue if broker is up,
        otherwise dispatches directly in a non-blocking daemon thread.
        Never freezes or blocks HTTP API responses.
        """
        import threading

        def _worker():
            if cls._is_redis_available():
                try:
                    from .tasks import send_notification_email_async
                    send_notification_email_async.delay(str(notification.id))
                    logger.info(f"Notification {notification.id} queued to Celery worker.")
                    return
                except Exception as e:
                    logger.info(f"Failed to queue to Celery ({e}). Falling back to direct email delivery.")

            # Fallback direct delivery
            try:
                from .email_service import NotificationEmailService
                NotificationEmailService.send_notification_email(notification)
            except Exception as ex:
                logger.error(f"Fallback email delivery failed for notification {notification.id}: {ex}", exc_info=True)

        thread = threading.Thread(target=_worker, daemon=True)
        thread.start()
