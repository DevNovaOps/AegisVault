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


    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        role = request.data.get('role', 'owner').lower()
        password = request.data.get('password', 'DemoPass123!')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, password=password, name=name or email.split('@')[0], role=role)
        AuditService.log(
            user=request.user,
            action_key='admin_user_created',
            action_title=f'Admin created user: {user.email}',
            category='admin',
            details=f'Created new {role} account for {user.name}',
        )
        return Response({
            'id': str(user.id),
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'status': 'Active',
            'statusType': 'active',
            'joined': user.date_joined.strftime('%d %b %Y'),
            'vault_count': 0,
            'is_2fa_enabled': user.is_2fa_enabled,
        }, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    """
    GET    /api/v1/admin/users/{id}/ — User detail
    PUT    /api/v1/admin/users/{id}/ — Update user
    DELETE /api/v1/admin/users/{id}/ — Delete user
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

        if 'name' in request.data:
            user.name = request.data['name'].strip()
        if 'email' in request.data:
            user.email = request.data['email'].strip()
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        if 'status' in request.data:
            user.is_active = (str(request.data['status']).lower() == 'active')
        if 'role' in request.data:
            user.role = request.data['role'].lower()

        user.save()

        action = 'activated' if user.is_active else 'suspended'
        AuditService.log(
            user=request.user,
            action_key=f'admin_user_{action}',
            action_title=f'User {action.title()}',
            details=f'Admin updated user {user.email}',
            category='admin',
        )

        return Response({
            'detail': f'User {user.email} updated.',
            'id': str(user.id),
            'name': user.name,
            'email': user.email,
            'is_active': user.is_active,
            'role': user.role,
            'status': 'Active' if user.is_active else 'Suspended',
        })

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        email = user.email
        user.delete()
        AuditService.log(
            user=request.user,
            action_key='admin_user_deleted',
            action_title=f'User Deleted: {email}',
            details=f'Admin permanently deleted user {email}',
            category='admin',
        )
        return Response({'detail': f'User {email} has been deleted.'})


class AdminUserSuspendView(APIView):
    """POST /api/v1/admin/users/{id}/suspend/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user == request.user:
            return Response(
                {'detail': 'You cannot suspend your own administrative account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = False
        user.save(update_fields=['is_active'])

        AuditService.log(
            user=request.user,
            action_key='admin_user_suspended',
            action_title='User Suspended',
            details=f'Admin suspended user {user.email}',
            category='admin',
        )

        return Response({
            'detail': f'User {user.email} has been suspended.',
            'status': 'Suspended',
            'is_active': False
        })


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

        return Response({
            'detail': f'User {user.email} has been activated.',
            'status': 'Active',
            'is_active': True
        })


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

    def post(self, request):
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Vault name is required'}, status=status.HTTP_400_BAD_REQUEST)

        owner_identifier = request.data.get('owner') or request.data.get('owner_email')
        owner = None
        if owner_identifier:
            owner = User.objects.filter(email=owner_identifier).first() or \
                    User.objects.filter(name=owner_identifier).first() or \
                    User.objects.filter(id=owner_identifier).first()

        if not owner:
            owner = User.objects.filter(role='owner').first() or request.user

        vault_type = (request.data.get('vault_type') or request.data.get('type') or 'personal').lower()
        required_shares = int(request.data.get('required_shares', 2))
        total_shares = int(request.data.get('total_shares', 3))

        vault = Vault.objects.create(
            name=name,
            owner=owner,
            vault_type=vault_type,
            status='active',
            required_shares=required_shares,
            total_shares=total_shares,
            encryption_algorithm='AES-256-GCM',
            description=request.data.get('description', '')
        )

        AuditService.log(
            user=request.user,
            action_key='VAULT_CREATE',
            action_title=f'Admin initialized vault: {vault.name}',
            category='vault',
            details=f'Created vault #{vault.id} assigned to {owner.name}',
            vault_name=vault.name,
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'id': str(vault.id),
            'name': vault.name,
            'description': vault.description,
            'vault_type': vault.vault_type,
            'status': vault.status,
            'owner_name': vault.owner.name,
            'owner_email': vault.owner.email,
            'required_shares': vault.required_shares,
            'total_shares': vault.total_shares,
            'active_shares': 0,
            'storage_used': vault.storage_used_display,
            'encryption': vault.encryption_algorithm,
            'created_at': vault.created_at.isoformat(),
            'updated_at': vault.updated_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


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

    def put(self, request, pk):
        v = get_object_or_404(Vault, pk=pk)
        name = request.data.get('name')
        status_val = request.data.get('status')
        vault_type = request.data.get('vault_type')
        if name:
            v.name = name.strip()
        if status_val:
            v.status = status_val.capitalize()
        if vault_type:
            v.vault_type = vault_type.lower()
        v.save()

        AuditService.log(
            user=request.user,
            action_key='vault_updated_admin',
            action_title='Vault Updated by Admin',
            details=f'Admin updated vault: {v.name}',
            category='vault',
        )

        return Response({
            'id': str(v.id),
            'name': v.name,
            'status': v.status,
            'vault_type': v.vault_type,
            'detail': 'Vault updated successfully.'
        })

    def delete(self, request, pk):
        v = get_object_or_404(Vault, pk=pk)
        vault_name = v.name
        v.delete()

        AuditService.log(
            user=request.user,
            action_key='vault_deleted_admin',
            action_title='Vault Deleted by Admin',
            details=f'Admin deleted vault: {vault_name}',
            category='vault',
        )

        return Response({'detail': f'Vault {vault_name} deleted successfully.'}, status=status.HTTP_200_OK)


# ─── Trustee Management ──────────────────────────────────────────────────────

class AdminTrusteeListView(APIView):
    """
    GET  /api/v1/admin/trustees/ — List all trustees
    POST /api/v1/admin/trustees/ — Add or invite a trustee
    """
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
            shares = VaultShare.objects.filter(trustee=t).select_related('vault')
            linked_vaults = [s.vault.name for s in shares if s.vault]
            profile = getattr(t, 'trustee_profile', None)
            phone = profile.phone if profile else getattr(t, 'phone', '') or '+1 (555) 234-8901'
            trustee_type = 'Primary' if len(linked_vaults) > 0 else 'Designated'

            data.append({
                'id': str(t.id),
                'name': t.name or (t.email.split('@')[0] if t.email else 'Trustee'),
                'email': t.email,
                'phone': phone,
                'trusteeType': trustee_type,
                'status': 'Verified' if t.is_active else 'Suspended',
                'statusType': 'verified' if t.is_active else 'rejected',
                'joined': t.date_joined.strftime('%d %b %Y'),
                'vaults_assigned': len(linked_vaults),
                'linked_vaults': linked_vaults,
                'notes': f'Designated custody trustee linked to {len(linked_vaults)} active vault(s).',
                'documentsVerified': True,
                'is_2fa_enabled': t.is_2fa_enabled,
            })

        return Response(data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        phone = request.data.get('phone', '').strip()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password='DemoPass123!',
            name=name or email.split('@')[0],
            role='trustee'
        )
        owner = User.objects.filter(role='owner').first()
        if owner:
            TrusteeProfile.objects.create(
                user=user,
                owner=owner,
                name=user.name,
                email=user.email,
                phone=phone or '+1 (555) 000-0000',
                status='Active',
                verification_status='Verified'
            )

        AuditService.log(
            user=request.user,
            action_key='admin_trustee_created',
            action_title=f'Trustee Enrolled: {user.email}',
            details=f'Admin enrolled new trustee {user.name}',
            category='trustee',
        )
        return Response({
            'id': str(user.id),
            'name': user.name,
            'email': user.email,
            'phone': phone or '+1 (555) 000-0000',
            'trusteeType': 'Primary',
            'status': 'Verified',
            'statusType': 'verified',
            'joined': user.date_joined.strftime('%d %b %Y'),
            'vaults_assigned': 0,
            'linked_vaults': [],
            'notes': 'New enrolled trustee',
            'documentsVerified': True,
            'is_2fa_enabled': user.is_2fa_enabled,
        }, status=status.HTTP_201_CREATED)


class AdminTrusteeDetailView(APIView):
    """
    GET    /api/v1/admin/trustees/{id}/ — Trustee detail
    PUT    /api/v1/admin/trustees/{id}/ — Update trustee
    DELETE /api/v1/admin/trustees/{id}/ — Deactivate/delete trustee
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        trustee = get_object_or_404(User.objects.filter(role='trustee'), pk=pk)
        shares = VaultShare.objects.filter(trustee=trustee).select_related('vault')
        linked_vaults = [s.vault.name for s in shares if s.vault]
        profile = getattr(trustee, 'trustee_profile', None)

        return Response({
            'id': str(trustee.id),
            'name': trustee.name,
            'email': trustee.email,
            'phone': profile.phone if profile else '+1 (555) 234-8901',
            'status': 'Verified' if trustee.is_active else 'Suspended',
            'statusType': 'verified' if trustee.is_active else 'rejected',
            'joined': trustee.date_joined.strftime('%d %b %Y'),
            'vaults_assigned': len(linked_vaults),
            'linked_vaults': linked_vaults,
            'notes': f'Designated custody trustee linked to {len(linked_vaults)} active vault(s).',
            'documentsVerified': True,
            'is_2fa_enabled': trustee.is_2fa_enabled,
        })

    def put(self, request, pk):
        trustee = get_object_or_404(User.objects.filter(role='trustee'), pk=pk)
        if 'name' in request.data:
            trustee.name = request.data['name'].strip()
        if 'email' in request.data:
            trustee.email = request.data['email'].strip()
        if 'status' in request.data:
            trustee.is_active = (str(request.data['status']).lower() in ['verified', 'active'])
        if 'is_active' in request.data:
            trustee.is_active = request.data['is_active']
        trustee.save()

        profile = getattr(trustee, 'trustee_profile', None)
        if profile and 'phone' in request.data:
            profile.phone = request.data['phone'].strip()
            profile.save(update_fields=['phone'])

        AuditService.log(
            user=request.user,
            action_key='admin_trustee_updated',
            action_title=f'Trustee Updated: {trustee.email}',
            details=f'Admin updated profile for trustee {trustee.name}',
            category='trustee',
        )
        return Response({'detail': f'Trustee {trustee.email} updated.'})

    def delete(self, request, pk):
        trustee = get_object_or_404(User.objects.filter(role='trustee'), pk=pk)
        trustee.is_active = False
        trustee.save(update_fields=['is_active'])
        AuditService.log(
            user=request.user,
            action_key='admin_trustee_deactivated',
            action_title=f'Trustee Deactivated: {trustee.email}',
            details=f'Admin deactivated trustee {trustee.name}',
            category='trustee',
        )
        return Response({'detail': f'Trustee {trustee.email} has been deactivated.'})


class AdminTrusteeApproveView(APIView):
    """POST /api/v1/admin/trustees/{id}/approve/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        trustee = get_object_or_404(User.objects.filter(role='trustee'), pk=pk)
        trustee.is_active = True
        trustee.save(update_fields=['is_active'])
        profile = getattr(trustee, 'trustee_profile', None)
        if profile:
            profile.verification_status = 'Verified'
            profile.status = 'Active'
            profile.save(update_fields=['verification_status', 'status'])

        AuditService.log(
            user=request.user,
            action_key='admin_trustee_approved',
            action_title=f'Trustee Approved: {trustee.email}',
            details=f'Admin approved verification credentials for {trustee.name}',
            category='trustee',
        )
        return Response({'detail': f'Trustee {trustee.email} verified and approved.'})


class AdminTrusteeRejectView(APIView):
    """POST /api/v1/admin/trustees/{id}/reject/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        trustee = get_object_or_404(User.objects.filter(role='trustee'), pk=pk)
        reason = request.data.get('reason', 'Verification rejected by administrator')
        trustee.is_active = False
        trustee.save(update_fields=['is_active'])
        profile = getattr(trustee, 'trustee_profile', None)
        if profile:
            profile.verification_status = 'Revoked'
            profile.status = 'Suspended'
            profile.save(update_fields=['verification_status', 'status'])

        AuditService.log(
            user=request.user,
            action_key='admin_trustee_rejected',
            action_title=f'Trustee Rejected: {trustee.email}',
            details=f'Admin rejected verification credentials for {trustee.name}: {reason}',
            category='trustee',
        )
        return Response({'detail': f'Trustee {trustee.email} marked as rejected.'})


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
            action_code = (log.action_key or 'SYSTEM_EVENT').upper()
            status_display = log.status.capitalize() if log.status else 'Success'
            data.append({
                'id': f"LOG-{str(log.id)[:8].upper()}",
                'raw_id': str(log.id),
                'date': log.timestamp.strftime('%Y-%m-%d'),
                'time': log.timestamp.strftime('%H:%M:%S'),
                'actionKey': log.action_key,
                'actionTitle': log.action_title,
                'action': action_code,
                'actionLabel': log.action_title or action_code.replace('_', ' ').title(),
                'details': log.details or log.action_title,
                'description': log.details or log.action_title,
                'category': log.category,
                'module': (log.category or 'system').capitalize(),
                'moduleFull': f"{(log.category or 'system').capitalize()} Module",
                'vault': log.vault_name,
                'user': log.user.name if log.user else 'System',
                'userName': log.user.name if log.user else 'System',
                'email': log.user.email if log.user else '',
                'ip': log.ip_address or '127.0.0.1',
                'ipAddress': log.ip_address or '127.0.0.1',
                'location': 'Local / System',
                'device': log.user_agent or 'Desktop Browser',
                'sessionId': str(log.id),
                'status': status_display,
                'timestamp': log.timestamp.strftime('%d %b %Y, %I:%M %p'),
                'dateSort': log.timestamp.isoformat(),
                'rawData': {
                    'eventId': f"LOG-{str(log.id)[:8].upper()}",
                    'action': action_code,
                    'module': (log.category or 'system').capitalize(),
                    'actor': {
                        'name': log.user.name if log.user else 'System',
                        'email': log.user.email if log.user else ''
                    },
                    'ipAddress': log.ip_address or '127.0.0.1',
                    'status': status_display,
                    'timestamp': log.timestamp.isoformat()
                }
            })

        return Response(data)
