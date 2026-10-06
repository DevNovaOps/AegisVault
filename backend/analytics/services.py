"""
AegisVault — Analytics Services
Platform-level aggregation for admin analytics dashboard.
"""
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta


class AnalyticsService:
    """Aggregation service for admin analytics."""

    @staticmethod
    def get_overview_metrics():
        """System-wide overview KPIs matching Admin mockData.overviewMetrics."""
        from accounts.models import User
        from vaults.models import Vault, VaultShare
        from releases.models import ReleaseRequest
        from audit.models import SecurityEvent
        from trustees.models import Invitation

        total_users = User.objects.count()
        total_trustees = User.objects.filter(role='trustee').count()
        active_vaults = Vault.objects.filter(status='Active').count()
        pending_requests = Invitation.objects.filter(status='pending').count() + \
            ReleaseRequest.objects.filter(status__in=['pending', 'scheduled']).count()
        security_events = SecurityEvent.objects.filter(is_resolved=False).count()

        return {
            'total_users': total_users,
            'total_trustees': total_trustees,
            'active_vaults': active_vaults,
            'pending_requests': pending_requests,
            'security_events': security_events,
            'system_uptime': '99.98%',
        }

    @staticmethod
    def get_user_growth(period='6m'):
        """User growth chart data matching Admin mockData.userGrowth."""
        from accounts.models import User

        now = timezone.now()
        data = {'labels': [], 'values': []}

        if period == '30d':
            for i in range(4, 0, -1):
                start = now - timedelta(days=i * 7)
                end = now - timedelta(days=(i - 1) * 7)
                count = User.objects.filter(date_joined__lte=end).count()
                data['labels'].append(f'Week {5 - i}')
                data['values'].append(count)
        elif period == '1y':
            for i in range(9, 0, -1):
                end = now - timedelta(days=i * 30)
                count = User.objects.filter(date_joined__lte=end).count()
                data['labels'].append(end.strftime('%b'))
                data['values'].append(count)
        else:  # 6m
            for i in range(7, 0, -1):
                end = now - timedelta(days=i * 30)
                count = User.objects.filter(date_joined__lte=end).count()
                data['labels'].append(end.strftime('%b'))
                data['values'].append(count)

        return data

    @staticmethod
    def get_vault_activity(period='6m'):
        """Vault activity chart data matching Admin mockData.vaultActivity."""
        from vaults.models import Vault
        from releases.models import ReleaseRequest
        from audit.models import AuditLog

        now = timezone.now()
        data = {'labels': [], 'created': [], 'accessed': [], 'released': []}

        if period == '30d':
            for i in range(4, 0, -1):
                start = now - timedelta(days=i * 7)
                end = now - timedelta(days=(i - 1) * 7)
                created = Vault.objects.filter(created_at__gte=start, created_at__lt=end).count()
                accessed = AuditLog.objects.filter(
                    category='vault', timestamp__gte=start, timestamp__lt=end
                ).count()
                released = ReleaseRequest.objects.filter(
                    released_at__gte=start, released_at__lt=end
                ).count()
                data['labels'].append(f'Week {5 - i}')
                data['created'].append(created)
                data['accessed'].append(accessed)
                data['released'].append(released)
        else:  # 6m or 1y
            months = 7 if period == '6m' else 9
            for i in range(months, 0, -1):
                start = now - timedelta(days=i * 30)
                end = now - timedelta(days=(i - 1) * 30)
                created = Vault.objects.filter(created_at__gte=start, created_at__lt=end).count()
                accessed = AuditLog.objects.filter(
                    category='vault', timestamp__gte=start, timestamp__lt=end
                ).count()
                released = ReleaseRequest.objects.filter(
                    released_at__gte=start, released_at__lt=end
                ).count()
                data['labels'].append(start.strftime('%b'))
                data['created'].append(created)
                data['accessed'].append(accessed)
                data['released'].append(released)

        return data

    @staticmethod
    def get_user_role_distribution():
        """User role distribution matching Admin mockData.userRoleDistribution."""
        from accounts.models import User

        total = User.objects.count() or 1
        owners = User.objects.filter(role='owner').count()
        trustees = User.objects.filter(role='trustee').count()
        admins = User.objects.filter(role='admin').count()
        others = total - owners - trustees - admins

        return {
            'total': total,
            'segments': [
                {'label': 'Vault Owners', 'count': owners, 'percent': round(owners / total * 100)},
                {'label': 'Trustees', 'count': trustees, 'percent': round(trustees / total * 100)},
                {'label': 'Admins', 'count': admins, 'percent': round(admins / total * 100)},
                {'label': 'Others', 'count': others, 'percent': round(others / total * 100)},
            ]
        }

    @staticmethod
    def get_vault_categories():
        """Vault category distribution matching Admin mockData.vaultCategories."""
        from vaults.models import Vault

        total = Vault.objects.count() or 1
        categories = Vault.objects.values('vault_type').annotate(
            count=Count('id')
        ).order_by('-count')

        segments = []
        for cat in categories:
            segments.append({
                'label': cat['vault_type'] or 'Other',
                'count': cat['count'],
                'percent': round(cat['count'] / total * 100),
            })

        if not segments:
            segments = [{'label': 'No Vaults', 'count': 0, 'percent': 100}]

        return {'total': total, 'segments': segments}
