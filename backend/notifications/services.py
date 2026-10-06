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

        logger.info(f"Notification created for {user.email}: [{notification_type}] {title}")

        # In a real system, we'd also trigger push/email based on prefs here.
        if prefs.email_enabled:
            # e.g., send_email_task.delay(...)
            pass

        return notification
