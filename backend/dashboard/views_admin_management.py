"""
AegisVault — Admin Management Views
Admin-only endpoints for managing users, vaults, and trustees platform-wide.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from accounts.permissions import IsAdminUser
from accounts.models import User
from accounts.serializers import UserSerializer
from vaults.models import Vault, VaultShare
from trustees.models import TrusteeProfile, Invitation
from audit.services import AuditService


# ─── User Management ─────────────────────────────────────────────────────────

class AdminUserListView(APIView):
    """GET /api/v1/admin/users/ — List all users with filtering"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all()

        role_filter = request.query_params.get('role')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search', '')

        if role_filter and role_filter != 'all':
            users = users.filter(role__iexact=role_filter)
        if status_filter == 'active':
            users = users.filter(is_active=True)
        elif status_filter == 'suspended':
            users = users.filter(is_active=False)
        if search:
            users = users.filter(name__icontains=search) | users.filter(email__icontains=search)

        data = []
        for u in users.order_by('-date_joined')[:100]:
            data.append({
                'id': str(u.id),
                'name': u.name,
                'email': u.email,
                'role': u.role,
                'status': 'Active' if u.is_active else 'Suspended',
                'statusType': 'active' if u.is_active else 'suspended',
                'joined': u.date_joined.strftime('%d %b %Y'),
                'last_login': u.last_login.isoformat() if u.last_login else None,
                'vault_count': u.vaults.count() if u.role == 'owner' else 0,
                'is_2fa_enabled': u.is_2fa_enabled,
            })

        return Response(data)


class AdminUserDetailView(APIView):
    """
    GET  /api/v1/admin/users/{id}/ — User detail
    PUT  /api/v1/admin/users/{id}/ — Update user (suspend/activate/change role)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return Response({
            'id': str(user.id),
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'status': 'Active' if user.is_active else 'Suspended',
            'is_active': user.is_active,
            'is_2fa_enabled': user.is_2fa_enabled,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'vault_count': user.vaults.count() if user.role == 'owner' else 0,
        })

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        if 'role' in request.data:
            user.role = request.data['role']

        user.save()

        action = 'activated' if user.is_active else 'suspended'
        AuditService.log(
            user=request.user,
            action_key=f'admin_user_{action}',
            action_title=f'User {action.title()}',
            details=f'Admin {action} user {user.email}',
            category='admin',
        )

        return Response({
            'detail': f'User {user.email} updated.',
            'id': str(user.id),
            'is_active': user.is_active,
            'role': user.role,
        })


class AdminUserSuspendView(APIView):
    """POST /api/v1/admin/users/{id}/suspend/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = False
        user.save(update_fields=['is_active'])

        AuditService.log(
            user=request.user,
            action_key='admin_user_suspended',
            action_title='User Suspended',
            details=f'Admin suspended user {user.email}',
            category='admin',
        )

        return Response({'detail': f'User {user.email} has been suspended.'})


class AdminUserActivateView(APIView):
    """POST /api/v1/admin/users/{id}/activate/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = True
        user.save(update_fields=['is_active'])

        AuditService.log(
            user=request.user,
            action_key='admin_user_activated',
            action_title='User Activated',
            details=f'Admin activated user {user.email}',
            category='admin',
        )

        return Response({'detail': f'User {user.email} has been activated.'})


# ─── Vault Management ────────────────────────────────────────────────────────

class AdminVaultListView(APIView):
    """GET /api/v1/admin/vaults/ — List all vaults"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        vaults = Vault.objects.select_related('owner').all()

        status_filter = request.query_params.get('status')
        type_filter = request.query_params.get('type')
        search = request.query_params.get('search', '')

        if status_filter and status_filter != 'all':
            vaults = vaults.filter(status__iexact=status_filter)
        if type_filter and type_filter != 'all':
            vaults = vaults.filter(vault_type__iexact=type_filter)
        if search:
            vaults = vaults.filter(name__icontains=search)

        data = []
        for v in vaults.order_by('-updated_at')[:100]:
            shares = v.shares.count()
            data.append({
                'id': str(v.id),
                'name': v.name,
                'description': v.description,
                'vault_type': v.vault_type,
                'status': v.status,
                'owner_name': v.owner.name,
                'owner_email': v.owner.email,
                'required_shares': v.required_shares,
                'total_shares': v.total_shares,
                'active_shares': shares,
                'storage_used': v.storage_used_display,
                'encryption': v.encryption_algorithm,
                'created_at': v.created_at.isoformat(),
                'updated_at': v.updated_at.isoformat(),
            })

        return Response(data)


class AdminVaultDetailView(APIView):
    """GET /api/v1/admin/vaults/{id}/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        v = get_object_or_404(Vault.objects.select_related('owner'), pk=pk)
        shares = v.shares.select_related('trustee').all()

        return Response({
            'id': str(v.id),
            'name': v.name,
            'description': v.description,
            'vault_type': v.vault_type,
            'status': v.status,
            'owner_name': v.owner.name,
            'owner_email': v.owner.email,
            'required_shares': v.required_shares,
            'total_shares': v.total_shares,
            'storage_used': v.storage_used_display,
            'encryption': v.encryption_algorithm,
            'release_condition': v.release_condition,
            'items_count': v.items.count(),
            'shares': [
                {
                    'trustee_name': s.trustee.name,
                    'trustee_email': s.trustee.email,
                    'access_level': s.access_level,
                    'status': s.status,
                }
                for s in shares
            ],
            'created_at': v.created_at.isoformat(),
        })


# ─── Trustee Management ──────────────────────────────────────────────────────

class AdminTrusteeListView(APIView):
    """GET /api/v1/admin/trustees/ — List all trustees"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        trustees = User.objects.filter(role='trustee')

        status_filter = request.query_params.get('status')
        search = request.query_params.get('search', '')

        if status_filter == 'active':
            trustees = trustees.filter(is_active=True)
        elif status_filter == 'suspended':
            trustees = trustees.filter(is_active=False)
        if search:
            trustees = trustees.filter(name__icontains=search) | \
                       trustees.filter(email__icontains=search)

        data = []
        for t in trustees.order_by('-date_joined')[:100]:
            vaults_assigned = VaultShare.objects.filter(trustee=t).count()
            data.append({
                'id': str(t.id),
                'name': t.name,
                'email': t.email,
                'status': 'Active' if t.is_active else 'Suspended',
                'statusType': 'active' if t.is_active else 'suspended',
                'joined': t.date_joined.strftime('%d %b %Y'),
                'vaults_assigned': vaults_assigned,
                'is_2fa_enabled': t.is_2fa_enabled,
            })

        return Response(data)


# ─── Pending Actions ─────────────────────────────────────────────────────────

class AdminPendingActionsView(APIView):
    """GET /api/v1/admin/pending-actions/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from releases.models import ReleaseRequest
        from audit.models import SecurityEvent

        pending_users = User.objects.filter(is_active=True, last_login=None).count()
        pending_trustees = Invitation.objects.filter(status='pending').count()
        security_alerts = SecurityEvent.objects.filter(is_resolved=False, severity__in=['high', 'critical']).count()
        pending_releases = ReleaseRequest.objects.filter(status__in=['authorized', 'in_progress']).count()

        actions = []
        if pending_users > 0:
            actions.append({
                'id': 'act-users',
                'title': 'Verify new users',
                'count': pending_users,
                'icon': 'user-check',
                'badgeColor': 'act-blue',
            })
        if pending_trustees > 0:
            actions.append({
                'id': 'act-trustees',
                'title': 'Review trustee requests',
                'count': pending_trustees,
                'icon': 'shield-alert',
                'badgeColor': 'act-amber',
            })
        if security_alerts > 0:
            actions.append({
                'id': 'act-security',
                'title': 'Investigate security alerts',
                'count': security_alerts,
                'icon': 'alert-triangle',
                'badgeColor': 'act-coral',
            })
        if pending_releases > 0:
            actions.append({
                'id': 'act-releases',
                'title': 'Approve vault releases',
                'count': pending_releases,
                'icon': 'key',
                'badgeColor': 'act-orange',
            })

        return Response(actions)


# ─── Admin Audit Logs (platform-wide) ────────────────────────────────────────

class AdminAuditLogView(APIView):
    """GET /api/v1/admin/audit/logs/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from audit.models import AuditLog

        logs = AuditLog.objects.select_related('user').all()

        category = request.query_params.get('category')
        search = request.query_params.get('search', '')

        if category and category != 'all':
            logs = logs.filter(category__iexact=category)
        if search:
            logs = logs.filter(action_title__icontains=search) | \
                   logs.filter(details__icontains=search)

        data = []
        for log in logs.order_by('-timestamp')[:200]:
            data.append({
                'id': str(log.id),
                'date': log.timestamp.strftime('%Y-%m-%d'),
                'time': log.timestamp.strftime('%H:%M:%S'),
                'actionKey': log.action_key,
                'actionTitle': log.action_title,
                'details': log.details,
                'category': log.category,
                'vault': log.vault_name,
                'user': log.user.name if log.user else 'System',
                'email': log.user.email if log.user else '',
                'ip': log.ip_address,
                'status': log.status,
                'timestamp': log.timestamp.isoformat(),
            })

        return Response(data)
