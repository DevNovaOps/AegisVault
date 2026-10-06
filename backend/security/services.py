"""
AegisVault — Security Services
Admin-level security overview, alerts, and event aggregation.
"""
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta


class SecurityService:
    """Aggregation service for admin security operations."""

    @staticmethod
    def get_overview():
        """Security overview for admin dashboard."""
        from audit.models import SecurityEvent, AuditLog
        from accounts.models import User

        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)

        # Active threats
        open_critical = SecurityEvent.objects.filter(
            severity='critical', is_resolved=False
        ).count()
        open_high = SecurityEvent.objects.filter(
            severity='high', is_resolved=False
        ).count()
        open_medium = SecurityEvent.objects.filter(
            severity='medium', is_resolved=False
        ).count()
        total_open = SecurityEvent.objects.filter(is_resolved=False).count()
        total_resolved = SecurityEvent.objects.filter(is_resolved=True).count()

        # Recent events
        events_24h = SecurityEvent.objects.filter(
            timestamp__gte=last_24h
        ).count()
        events_7d = SecurityEvent.objects.filter(
            timestamp__gte=last_7d
        ).count()

        # Failed logins in last 24h
        failed_logins_24h = AuditLog.objects.filter(
            action_key='login_failed',
            timestamp__gte=last_24h,
        ).count()

        # Active users in last 7d
        active_users_7d = User.objects.filter(
            last_login__gte=last_7d
        ).count()

        # Threat level
        if open_critical > 0:
            threat_level = 'Critical'
        elif open_high > 2:
            threat_level = 'High'
        elif open_medium > 5:
            threat_level = 'Elevated'
        else:
            threat_level = 'Normal'

        return {
            'threat_level': threat_level,
            'open_critical': open_critical,
            'open_high': open_high,
            'open_medium': open_medium,
            'total_open_alerts': total_open,
            'total_resolved': total_resolved,
            'events_last_24h': events_24h,
            'events_last_7d': events_7d,
            'failed_logins_24h': failed_logins_24h,
            'active_users_7d': active_users_7d,
        }

    @staticmethod
    def get_alerts():
        """Unresolved security alerts."""
        from audit.models import SecurityEvent

        alerts = SecurityEvent.objects.filter(
            is_resolved=False
        ).order_by('-timestamp')[:50]

        return [
            {
                'id': str(a.id),
                'event_type': a.event_type,
                'severity': a.severity,
                'title': a.title,
                'description': a.description,
                'source_ip': a.source_ip,
                'resource': a.resource,
                'user_email': a.user.email if a.user else 'Unknown',
                'timestamp': a.timestamp.isoformat(),
            }
            for a in alerts
        ]
