"""
AegisVault — Dashboard Views
Owner and Admin dashboard KPI and chart endpoints.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum

from accounts.permissions import IsOwner, IsAdminUser
from vaults.models import Vault, VaultAsset, VaultShare
from trustees.models import TrusteeProfile, Invitation
from heartbeat.models import HeartbeatConfig
from accounts.models import User
from audit.models import AuditLog, SecurityEvent


class OwnerDashboardKPIView(APIView):
    """GET /api/v1/owner/dashboard/kpis"""
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        user = request.user

        total_vaults = Vault.objects.filter(owner=user).count()
        active_vaults = Vault.objects.filter(owner=user, status='Active').count()
        
        # Trustees (active)
        trustees = TrusteeProfile.objects.filter(owner=user, status='Active').count()
        
        # Pending Invitations
        pending_invitations = TrusteeProfile.objects.filter(owner=user, status='Pending').count()
        
        # Release Requests (pending or in progress releases)
        from releases.models import ReleaseRequest
        release_requests = ReleaseRequest.objects.filter(vault__owner=user, status__in=['pending', 'in_progress']).count()

        return Response({
            'total_vaults': total_vaults,
            'active_vaults': active_vaults,
            'trustees': trustees,
            'pending_invitations': pending_invitations,
            'release_requests': release_requests,
        })


class OwnerDashboardActivityView(APIView):
    """GET /api/v1/owner/dashboard/activity"""
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        logs = AuditLog.objects.filter(
            user=request.user
        ).order_by('-timestamp')[:10]

        data = [
            {
                'id': str(log.id),
                'actionTitle': log.action_title,
                'details': log.details,
                'category': log.category,
                'status': log.status,
                'timestamp': log.timestamp.isoformat(),
            }
            for log in logs
        ]
        return Response(data)


# ─── Admin Dashboard Views ───────────────────────────────────────────────────

class AdminDashboardStatsView(APIView):
    """GET /api/v1/admin/dashboard/stats"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        active_owners = User.objects.filter(role='owner', is_active=True).count()
        active_trustees = User.objects.filter(role='trustee', is_active=True).count()
        active_vaults = Vault.objects.filter(status='Active').count()
        total_shares = VaultShare.objects.count()
        active_shares = VaultShare.objects.filter(status='active').count()

        system_health = 'Healthy'
        critical_alerts = SecurityEvent.objects.filter(
            severity='critical', is_resolved=False
        ).count()

        if critical_alerts > 0:
            system_health = 'Degraded'

        return Response({
            'total_users': total_users,
            'active_owners': active_owners,
            'active_trustees': active_trustees,
            'active_vaults': active_vaults,
            'total_shares': total_shares,
            'active_shares': active_shares,
            'system_health': system_health,
            'critical_alerts': critical_alerts,
        })


class AdminDashboardChartDataView(APIView):
    """GET /api/v1/admin/dashboard/chart-data"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Mocking timeline data for the admin chart as requested by frontend
        # In a real app, this would aggregate by day over the last 30 days
        return Response({
            'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            'vaults_created': [12, 19, 15, 25, 22, 30, 28],
            'active_users': [120, 132, 145, 150, 160, 165, 172],
            'system_load': [45, 42, 50, 55, 48, 40, 42],
        })
