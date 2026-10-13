"""
AegisVault — Reports Services
Generates admin reports: audit summary, user report, vault report, compliance.
"""
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta


class ReportService:
    """Service for generating admin reports."""

    @staticmethod
    def generate_audit_summary(days=30):
        """Audit summary for the last N days."""
        from audit.models import AuditLog
        from django.db.models.functions import TruncDate

        cutoff = timezone.now() - timedelta(days=days)
        logs = AuditLog.objects.filter(timestamp__gte=cutoff)

        by_category = list(logs.values('category').annotate(count=Count('id')).order_by('-count'))
        by_status = list(logs.values('status').annotate(count=Count('id')).order_by('-count'))
        total = logs.count() or 1

        # Build daily trends timelines (7 days, 12 days, 30 days)
        daily_qs = logs.annotate(day=TruncDate('timestamp')).values('day').annotate(count=Count('id')).order_by('day')
        daily_dict = {item['day'].strftime('%Y-%m-%d'): item['count'] for item in daily_qs}
        today = timezone.now().date()

        def build_timeline(num_days):
            timeline = []
            for i in range(num_days - 1, -1, -1):
                d = today - timedelta(days=i)
                d_str = d.strftime('%Y-%m-%d')
                timeline.append({
                    'date': d.strftime('%b %d'),
                    'fullDate': d.strftime('%B %d, %Y'),
                    'count': daily_dict.get(d_str, 0)
                })
            return timeline

        trends = {
            '7days': build_timeline(7),
            '12days': build_timeline(12),
            '30days': build_timeline(30),
        }

        # Category breakdown for donut chart
        user_cnt = sum(c['count'] for c in by_category if c['category'] in ['auth', 'profile', 'trustee'])
        vault_cnt = sum(c['count'] for c in by_category if c['category'] in ['vault', 'release'])
        sec_cnt = sum(c['count'] for c in by_category if c['category'] in ['security', 'heartbeat'])
        sys_cnt = sum(c['count'] for c in by_category if c['category'] in ['system'])

        user_pct = round((user_cnt / total) * 100)
        vault_pct = round((vault_cnt / total) * 100)
        sec_pct = round((sec_cnt / total) * 100)
        sys_pct = max(0, 100 - user_pct - vault_pct - sec_pct)

        category_breakdown = [
            {'label': 'User Reports', 'percentage': user_pct, 'color': '#2563EB', 'count': user_cnt},
            {'label': 'Vault Reports', 'percentage': vault_pct, 'color': '#F59E0B', 'count': vault_cnt},
            {'label': 'Security Reports', 'percentage': sec_pct, 'color': '#10B981', 'count': sec_cnt},
            {'label': 'System Reports', 'percentage': sys_pct, 'color': '#8B5CF6', 'count': sys_cnt},
        ]

        # Status breakdown for donut chart
        completed_cnt = sum(s['count'] for s in by_status if s['status'].lower() in ['success', 'completed'])
        pending_cnt = total - completed_cnt
        completed_pct = round((completed_cnt / total) * 100)
        pending_pct = 100 - completed_pct

        status_breakdown = [
            {'label': 'Completed', 'percentage': completed_pct, 'color': '#10B981', 'count': completed_cnt},
            {'label': 'Pending Review', 'percentage': pending_pct, 'color': '#F59E0B', 'count': pending_cnt},
        ]

        return {
            'report_type': 'audit_summary',
            'period_days': days,
            'total_events': total,
            'by_category': by_category,
            'by_status': by_status,
            'trends': trends,
            'category_breakdown': category_breakdown,
            'status_breakdown': status_breakdown,
            'generated_at': timezone.now().isoformat(),
        }

    @staticmethod
    def generate_user_report():
        """User statistics report."""
        from accounts.models import User

        total = User.objects.count()
        active = User.objects.filter(is_active=True).count()
        by_role = User.objects.values('role').annotate(count=Count('id')).order_by('-count')

        recent_30d = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=30)
        ).count()

        return {
            'report_type': 'user_report',
            'total_users': total,
            'active_users': active,
            'inactive_users': total - active,
            'new_users_30d': recent_30d,
            'by_role': list(by_role),
            'generated_at': timezone.now().isoformat(),
        }

    @staticmethod
    def generate_vault_report():
        """Vault statistics report."""
        from vaults.models import Vault, VaultAsset, VaultShare

        total_vaults = Vault.objects.count()
        active_vaults = Vault.objects.filter(status='Active').count()
        total_items = VaultAsset.objects.count()
        total_shares = VaultShare.objects.count()
        active_shares = VaultShare.objects.filter(status='active').count()

        by_status = Vault.objects.values('status').annotate(count=Count('id')).order_by('-count')

        return {
            'report_type': 'vault_report',
            'total_vaults': total_vaults,
            'active_vaults': active_vaults,
            'total_items': total_items,
            'total_shares': total_shares,
            'active_shares': active_shares,
            'by_status': list(by_status),
            'generated_at': timezone.now().isoformat(),
        }

    @staticmethod
    def generate_security_report(days=30):
        """Security events report."""
        from audit.models import SecurityEvent

        cutoff = timezone.now() - timedelta(days=days)
        events = SecurityEvent.objects.filter(timestamp__gte=cutoff)

        by_severity = events.values('severity').annotate(count=Count('id')).order_by('-count')
        by_type = events.values('event_type').annotate(count=Count('id')).order_by('-count')
        total = events.count()
        resolved = events.filter(is_resolved=True).count()

        return {
            'report_type': 'security_report',
            'period_days': days,
            'total_events': total,
            'resolved_events': resolved,
            'unresolved_events': total - resolved,
            'by_severity': list(by_severity),
            'by_type': list(by_type),
            'generated_at': timezone.now().isoformat(),
        }

    @staticmethod
    def generate_compliance_report():
        """Platform compliance summary."""
        from accounts.models import User
        from vaults.models import Vault
        from heartbeat.models import HeartbeatConfig
        from releases.models import ReleaseRequest

        owners_with_heartbeat = HeartbeatConfig.objects.filter(state='active').count()
        total_owners = User.objects.filter(role='owner').count() or 1
        heartbeat_compliance = round(owners_with_heartbeat / total_owners * 100, 1)

        active_releases = ReleaseRequest.objects.filter(
            status__in=['pending', 'in_progress', 'scheduled']
        ).count()

        return {
            'report_type': 'compliance_report',
            'heartbeat_compliance_pct': heartbeat_compliance,
            'owners_with_active_heartbeat': owners_with_heartbeat,
            'total_owners': total_owners,
            'active_release_requests': active_releases,
            'encryption_standard': 'AES-256-GCM',
            'audit_chain_integrity': 'SHA-256 Hash Chain',
            'generated_at': timezone.now().isoformat(),
        }
