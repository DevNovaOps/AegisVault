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

        cutoff = timezone.now() - timedelta(days=days)
        logs = AuditLog.objects.filter(timestamp__gte=cutoff)

        by_category = logs.values('category').annotate(count=Count('id')).order_by('-count')
        by_status = logs.values('status').annotate(count=Count('id')).order_by('-count')
        total = logs.count()

        return {
            'report_type': 'audit_summary',
            'period_days': days,
            'total_events': total,
            'by_category': list(by_category),
            'by_status': list(by_status),
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
