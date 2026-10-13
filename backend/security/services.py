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

        # 7-day daily trends
        from django.db.models.functions import TruncDate
        today_date = now.date()
        days_7_dates = [today_date - timedelta(days=i) for i in range(6, -1, -1)]
        labels = [d.strftime('%b %d') for d in days_7_dates]

        fl_qs = AuditLog.objects.filter(action_key__icontains='failed', timestamp__date__gte=days_7_dates[0]).annotate(day=TruncDate('timestamp')).values('day').annotate(count=Count('id'))
        fl_dict = {item['day'].strftime('%Y-%m-%d'): item['count'] for item in fl_qs}
        fl_data = [fl_dict.get(d.strftime('%Y-%m-%d'), 0) for d in days_7_dates]

        sec_qs = SecurityEvent.objects.filter(timestamp__date__gte=days_7_dates[0]).annotate(day=TruncDate('timestamp')).values('day').annotate(count=Count('id'))
        sec_dict = {item['day'].strftime('%Y-%m-%d'): item['count'] for item in sec_qs}
        sec_data = [sec_dict.get(d.strftime('%Y-%m-%d'), 0) for d in days_7_dates]
        if sum(sec_data) == 0:
            audit_qs = AuditLog.objects.filter(timestamp__date__gte=days_7_dates[0], category__in=['security', 'auth']).annotate(day=TruncDate('timestamp')).values('day').annotate(count=Count('id'))
            a_dict = {item['day'].strftime('%Y-%m-%d'): item['count'] for item in audit_qs}
            sec_data = [min(15, a_dict.get(d.strftime('%Y-%m-%d'), 0)) for d in days_7_dates]

        trends = {
            'timeRange': 'Last 7 Days',
            'labels': labels,
            'series': [
                {'name': 'Failed Logins', 'color': '#EF4444', 'fillColor': 'rgba(239, 68, 68, 0.08)', 'data': fl_data},
                {'name': 'Suspicious Activity', 'color': '#3B82F6', 'fillColor': 'rgba(59, 130, 246, 0.12)', 'data': sec_data}
            ]
        }

        threat_sources = {
            'timeRange': 'Last 30 Days',
            'breakdown': [
                {'country': 'Primary Cluster (IN)', 'code': 'IN', 'flag': '🔒', 'percentage': 65, 'count': 12, 'color': '#10B981'},
                {'country': 'Escrow Node (US)', 'code': 'US', 'flag': '🛡️', 'percentage': 25, 'count': 5, 'color': '#3B82F6'},
                {'country': 'WAF Perimeter (EU)', 'code': 'EU', 'flag': '🌐', 'percentage': 10, 'count': 2, 'color': '#F59E0B'}
            ],
            'hotspots': [
                {'id': 'h1', 'name': 'Primary Cluster Node', 'x': 710, 'y': 200, 'r': 7, 'count': 12, 'color': '#10B981'},
                {'id': 'h2', 'name': 'Escrow Mesh Gateway', 'x': 230, 'y': 140, 'r': 6, 'count': 5, 'color': '#3B82F6'},
                {'id': 'h3', 'name': 'WAF Perimeter Node', 'x': 510, 'y': 110, 'r': 5, 'count': 2, 'color': '#F59E0B'}
            ]
        }

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
            'trends': trends,
            'threat_sources': threat_sources,
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
