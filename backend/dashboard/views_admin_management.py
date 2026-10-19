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
from datetime import timedelta
import secrets
from accounts.permissions import IsAdminUser
from accounts.models import User
from accounts.serializers import UserSerializer
from vaults.models import Vault, VaultShare
from trustees.models import TrusteeProfile, Invitation
from trustees.services import TrusteeEmailService
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
            trustee_count = 0
            if u.role == 'owner':
                profile_trustees = set(TrusteeProfile.objects.filter(owner=u).values_list('email', flat=True))
                share_trustees = set(VaultShare.objects.filter(vault__owner=u).values_list('trustee__email', flat=True))
                invitation_trustees = set(Invitation.objects.filter(owner=u).values_list('invitee_email', flat=True))
                trustee_count = len(profile_trustees | share_trustees | invitation_trustees)

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
                'trustee_count': trustee_count,
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
        vaults_list = []
        trustees_list = []
        trustee_count = 0

        if user.role == 'owner':
            for v in user.vaults.all():
                vaults_list.append({
                    'id': str(v.id),
                    'name': v.name,
                    'type': v.vault_type.title() if v.vault_type else 'Personal',
                    'status': v.status.title() if v.status else 'Active',
                    'trigger': getattr(v, 'trigger_type', 'Heartbeat DMS'),
                    'required_shares': v.required_shares,
                    'total_shares': v.total_shares,
                    'storage_used': v.storage_used_display,
                })

            t_profiles = TrusteeProfile.objects.filter(owner=user).select_related('user')
            seen_emails = set()
            for tp in t_profiles:
                email_lower = tp.email.lower()
                seen_emails.add(email_lower)
                tp_vaults = []
                if tp.user:
                    tp_vaults = list(VaultShare.objects.filter(vault__owner=user, trustee=tp.user).values_list('vault__name', flat=True))
                if not tp_vaults:
                    tp_vaults = list(Invitation.objects.filter(owner=user, invitee_email__iexact=tp.email).values_list('vault__name', flat=True))
                trustees_list.append({
                    'id': str(tp.id),
                    'name': tp.name or (tp.user.name if tp.user else tp.email.split('@')[0]),
                    'email': tp.email,
                    'phone': tp.phone or (tp.user.phone if tp.user else ''),
                    'relationship': tp.relationship or 'Designated',
                    'status': tp.status or 'Active',
                    'verification_status': tp.verification_status or 'Verified',
                    'vaults': tp_vaults or ['All Vaults'],
                    'date_added': tp.date_added.strftime('%d %b %Y') if tp.date_added else 'Recent',
                })

            for share in VaultShare.objects.filter(vault__owner=user).select_related('trustee', 'vault'):
                t_user = share.trustee
                if t_user and t_user.email.lower() not in seen_emails:
                    seen_emails.add(t_user.email.lower())
                    trustees_list.append({
                        'id': str(share.id),
                        'name': t_user.name or t_user.email.split('@')[0],
                        'email': t_user.email,
                        'phone': getattr(t_user, 'phone', ''),
                        'relationship': 'Designated Trustee',
                        'status': 'Active' if t_user.is_active else 'Suspended',
                        'verification_status': 'Verified' if t_user.is_active else 'Pending',
                        'vaults': [share.vault.name] if share.vault else [],
                        'date_added': share.created_at.strftime('%d %b %Y') if hasattr(share, 'created_at') and share.created_at else 'Recent',
                    })

            trustee_count = len(trustees_list)

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
            'vault_count': len(vaults_list),
            'vaults': vaults_list,
            'trustee_count': trustee_count,
            'trustees': trustees_list,
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

        from heartbeat.models import HeartbeatConfig
        data = []
        for v in vaults.order_by('-updated_at')[:100]:
            shares = v.shares.count()
            hc = HeartbeatConfig.objects.filter(owner=v.owner).first()
            hb_days = v.inactivity_days if (v.inactivity_days and v.inactivity_days > 0) else (hc.interval_days if hc else 7)
            hb_status = hc.state.capitalize() if (hc and hc.state) else 'Healthy'
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
                'inactivity_days': hb_days,
                'heartbeat_schedule': f"{hb_days} Days",
                'heartbeat_status': hb_status,
                'storage_used': v.storage_used_display,
                'encryption': v.encryption_algorithm,
                'items_count': v.assets.count(),
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
        from heartbeat.models import HeartbeatConfig
        hc = HeartbeatConfig.objects.filter(owner=v.owner).first()
        hb_days = v.inactivity_days if (v.inactivity_days and v.inactivity_days > 0) else (hc.interval_days if hc else 7)
        hb_status = hc.state.capitalize() if (hc and hc.state) else 'Healthy'

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
            'release_condition': v.release_condition or f"Threshold Verification ({v.required_shares}-of-{v.total_shares})",
            'inactivity_days': hb_days,
            'heartbeat_schedule': f"{hb_days} Days",
            'heartbeat_status': hb_status,
            'items_count': v.assets.count(),
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
    GET  /api/v1/admin/trustees/ — List all trustees platform-wide (registered & pending)
    POST /api/v1/admin/trustees/ — Add or invite a trustee
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search', '').lower()

        data = []
        registered_emails = set()

        # 1. Registered User trustees
        trustees = User.objects.filter(role='trustee')
        if search:
            trustees = trustees.filter(name__icontains=search) | trustees.filter(email__icontains=search)

        for t in trustees.order_by('-date_joined')[:100]:
            registered_emails.add(t.email.lower())
            shares = VaultShare.objects.filter(trustee=t).select_related('vault', 'vault__owner')
            linked_vaults = [s.vault.name for s in shares if s.vault]

            profile = getattr(t, 'trustee_profile', None)
            if not profile:
                profile = TrusteeProfile.objects.filter(email__iexact=t.email).first()

            phone = profile.phone if profile else getattr(t, 'phone', '') or '+1 (555) 234-8901'
            trustee_type = 'Primary' if len(linked_vaults) > 0 else 'Designated'

            owner_name = profile.owner.name if profile and profile.owner else ''
            owner_email = profile.owner.email if profile and profile.owner else ''
            if not owner_name:
                first_share = shares.first()
                if first_share and first_share.vault and first_share.vault.owner:
                    owner_name = first_share.vault.owner.name
                    owner_email = first_share.vault.owner.email

            relationship = profile.relationship if profile else 'Designated Trustee'

            # Determine accurate status: Pending vs Verified vs Suspended
            has_pending_inv = Invitation.objects.filter(invitee_email__iexact=t.email, status='pending').exists()
            if not t.is_active:
                status_val = 'Suspended'
                status_type = 'rejected'
            elif (profile and profile.verification_status in ['Pending', 'Not Started']) or (profile and profile.status == 'Invited') or has_pending_inv:
                status_val = 'Pending'
                status_type = 'pending'
            elif not profile and len(linked_vaults) == 0:
                status_val = 'Pending'
                status_type = 'pending'
            else:
                status_val = 'Verified'
                status_type = 'verified'

            # Status filtering
            if status_filter == 'active' and status_val != 'Verified':
                continue
            if status_filter == 'pending' and status_val != 'Pending':
                continue
            if status_filter == 'suspended' and status_val not in ['Suspended', 'Rejected']:
                continue

            data.append({
                'id': str(t.id),
                'name': t.name or (t.email.split('@')[0] if t.email else 'Trustee'),
                'email': t.email,
                'phone': phone,
                'trusteeType': trustee_type,
                'status': status_val,
                'statusType': status_type,
                'joined': t.date_joined.strftime('%d %b %Y'),
                'vaults_assigned': len(linked_vaults),
                'linked_vaults': linked_vaults,
                'owner_name': owner_name,
                'owner_email': owner_email,
                'relationship': relationship,
                'notes': f'Designated custody trustee linked to {len(linked_vaults)} active vault(s).' + (f' Designated by {owner_name}.' if owner_name else ''),
                'documentsVerified': (status_val == 'Verified'),
                'is_2fa_enabled': t.is_2fa_enabled,
            })

        # 2. Designated / Pending Trustees who have not yet completed user signup (user=None)
        unregistered_profiles = TrusteeProfile.objects.filter(user=None).select_related('owner')
        for tp in unregistered_profiles.order_by('-date_added')[:50]:
            if tp.email.lower() in registered_emails:
                continue

            if search and search not in tp.name.lower() and search not in tp.email.lower():
                continue

            # Linked vaults from invitation
            invitations = Invitation.objects.filter(trustee_profile=tp).select_related('vault')
            linked_vaults = [i.vault.name for i in invitations if i.vault]
            if not linked_vaults:
                owner_vault = Vault.objects.filter(owner=tp.owner).first()
                if owner_vault:
                    linked_vaults = [owner_vault.name]

            if tp.status == 'Removed' or tp.verification_status == 'Revoked':
                status_val = 'Rejected'
                status_type = 'rejected'
            elif tp.verification_status == 'Verified':
                status_val = 'Verified'
                status_type = 'verified'
            else:
                status_val = 'Pending'
                status_type = 'pending'

            if status_filter == 'active' and status_val != 'Verified':
                continue
            if status_filter == 'pending' and status_val != 'Pending':
                continue
            if status_filter == 'suspended' and status_val not in ['Suspended', 'Rejected']:
                continue

            data.append({
                'id': str(tp.id),
                'name': tp.name or tp.email.split('@')[0],
                'email': tp.email,
                'phone': tp.phone or '+1 (555) 234-8901',
                'trusteeType': tp.relationship or 'Designated',
                'status': status_val,
                'statusType': status_type,
                'joined': tp.date_added.strftime('%d %b %Y'),
                'vaults_assigned': len(linked_vaults),
                'linked_vaults': linked_vaults,
                'owner_name': tp.owner.name if tp.owner else 'Platform Owner',
                'owner_email': tp.owner.email if tp.owner else '',
                'relationship': tp.relationship,
                'notes': f'Designated custody trustee invited by {tp.owner.name if tp.owner else "Owner"}. Pending invitation verification.',
                'documentsVerified': False,
                'is_2fa_enabled': False,
            })

        return Response(data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        phone = request.data.get('phone', '').strip()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        owner = User.objects.filter(role='owner').first() or request.user
        vault = Vault.objects.filter(owner=owner).first() or Vault.objects.first()

        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(
                email=email,
                password='DemoPass123!',
                name=name or email.split('@')[0],
                role='trustee'
            )

        profile, _ = TrusteeProfile.objects.get_or_create(
            owner=owner,
            email=email,
            defaults={
                'user': user,
                'name': user.name,
                'phone': phone or '+1 (555) 000-0000',
                'status': 'Active',
                'verification_status': 'Verified'
            }
        )
        if not profile.user:
            profile.user = user
            profile.save(update_fields=['user'])

        # Create invitation if vault is present
        email_sent = False
        email_msg = ''
        if vault:
            invitation, _ = Invitation.objects.get_or_create(
                owner=owner,
                invitee_email=email,
                defaults={
                    'trustee_profile': profile,
                    'invitee_name': user.name,
                    'relationship': 'Primary Trustee',
                    'vault': vault,
                    'note': 'Direct administrator enrollment.',
                    'expires_at': timezone.now() + timedelta(days=14)
                }
            )
            email_sent, email_msg = TrusteeEmailService.send_trustee_invitation_email(invitation, request)

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
            'vaults_assigned': 1 if vault else 0,
            'linked_vaults': [vault.name] if vault else [],
            'notes': 'Enrolled trustee',
            'documentsVerified': True,
            'is_2fa_enabled': user.is_2fa_enabled,
            'email_sent': email_sent,
            'email_status': email_msg,
        }, status=status.HTTP_201_CREATED)


class AdminTrusteeDetailView(APIView):
    """
    GET    /api/v1/admin/trustees/{id}/ — Trustee detail
    PUT    /api/v1/admin/trustees/{id}/ — Update trustee
    DELETE /api/v1/admin/trustees/{id}/ — Deactivate/delete trustee
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        trustee = User.objects.filter(role='trustee', pk=pk).first()
        if trustee:
            shares = VaultShare.objects.filter(trustee=trustee).select_related('vault', 'vault__owner')
            linked_vaults = [s.vault.name for s in shares if s.vault]
            profile = getattr(trustee, 'trustee_profile', None)
            if not profile:
                profile = TrusteeProfile.objects.filter(email__iexact=trustee.email).first()

            owner_name = profile.owner.name if profile and profile.owner else ''
            owner_email = profile.owner.email if profile and profile.owner else ''
            if not owner_name:
                first_share = shares.first()
                if first_share and first_share.vault and first_share.vault.owner:
                    owner_name = first_share.vault.owner.name
                    owner_email = first_share.vault.owner.email

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
                'owner_name': owner_name,
                'owner_email': owner_email,
                'relationship': profile.relationship if profile else 'Designated Trustee',
                'notes': f'Designated custody trustee linked to {len(linked_vaults)} active vault(s).' + (f' Designated by {owner_name}.' if owner_name else ''),
                'documentsVerified': trustee.is_active,
                'is_2fa_enabled': trustee.is_2fa_enabled,
            })

        profile = get_object_or_404(TrusteeProfile, pk=pk)
        invitations = Invitation.objects.filter(trustee_profile=profile).select_related('vault')
        linked_vaults = [i.vault.name for i in invitations if i.vault]
        return Response({
            'id': str(profile.id),
            'name': profile.name,
            'email': profile.email,
            'phone': profile.phone or '+1 (555) 234-8901',
            'status': 'Pending' if profile.verification_status != 'Verified' else 'Verified',
            'statusType': 'pending' if profile.verification_status != 'Verified' else 'verified',
            'joined': profile.date_added.strftime('%d %b %Y'),
            'vaults_assigned': len(linked_vaults),
            'linked_vaults': linked_vaults,
            'owner_name': profile.owner.name if profile.owner else '',
            'owner_email': profile.owner.email if profile.owner else '',
            'relationship': profile.relationship,
            'notes': 'Designated trustee pending identity verification.',
            'documentsVerified': profile.verification_status == 'Verified',
            'is_2fa_enabled': False,
        })

    def put(self, request, pk):
        trustee = User.objects.filter(role='trustee', pk=pk).first()
        if trustee:
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

        profile = get_object_or_404(TrusteeProfile, pk=pk)
        if 'name' in request.data:
            profile.name = request.data['name'].strip()
        if 'phone' in request.data:
            profile.phone = request.data['phone'].strip()
        if 'relationship' in request.data:
            profile.relationship = request.data['relationship'].strip()
        profile.save()
        return Response({'detail': f'Trustee profile {profile.email} updated.'})

    def delete(self, request, pk):
        trustee = User.objects.filter(role='trustee', pk=pk).first()
        if trustee:
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

        profile = get_object_or_404(TrusteeProfile, pk=pk)
        profile.status = 'Removed'
        profile.verification_status = 'Revoked'
        profile.save(update_fields=['status', 'verification_status'])
        return Response({'detail': f'Trustee nomination for {profile.email} has been removed.'})


class AdminTrusteeApproveView(APIView):
    """POST /api/v1/admin/trustees/{id}/approve/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        trustee = User.objects.filter(role='trustee', pk=pk).first()
        if trustee:
            trustee.is_active = True
            trustee.save(update_fields=['is_active'])
            profile = getattr(trustee, 'trustee_profile', None) or TrusteeProfile.objects.filter(email__iexact=trustee.email).first()
            if profile:
                profile.verification_status = 'Verified'
                profile.status = 'Active'
                profile.save(update_fields=['verification_status', 'status'])
            target_name = trustee.name
            target_email = trustee.email
        else:
            profile = get_object_or_404(TrusteeProfile, pk=pk)
            profile.verification_status = 'Verified'
            profile.status = 'Active'
            profile.save(update_fields=['verification_status', 'status'])
            if profile.user:
                profile.user.is_active = True
                profile.user.save(update_fields=['is_active'])
            target_name = profile.name
            target_email = profile.email

        AuditService.log(
            user=request.user,
            action_key='admin_trustee_approved',
            action_title=f'Trustee Approved: {target_email}',
            details=f'Admin approved verification credentials for {target_name}',
            category='trustee',
        )
        return Response({'detail': f'Trustee {target_email} verified and approved.'})


class AdminTrusteeRejectView(APIView):
    """POST /api/v1/admin/trustees/{id}/reject/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        reason = request.data.get('reason', 'Verification rejected by administrator')
        trustee = User.objects.filter(role='trustee', pk=pk).first()
        if trustee:
            trustee.is_active = False
            trustee.save(update_fields=['is_active'])
            profile = getattr(trustee, 'trustee_profile', None) or TrusteeProfile.objects.filter(email__iexact=trustee.email).first()
            if profile:
                profile.verification_status = 'Revoked'
                profile.status = 'Suspended'
                profile.save(update_fields=['verification_status', 'status'])
            target_name = trustee.name
            target_email = trustee.email
        else:
            profile = get_object_or_404(TrusteeProfile, pk=pk)
            profile.verification_status = 'Revoked'
            profile.status = 'Suspended'
            profile.save(update_fields=['verification_status', 'status'])
            if profile.user:
                profile.user.is_active = False
                profile.user.save(update_fields=['is_active'])
            target_name = profile.name
            target_email = profile.email

        AuditService.log(
            user=request.user,
            action_key='admin_trustee_rejected',
            action_title=f'Trustee Rejected: {target_email}',
            details=f'Admin rejected verification credentials for {target_name}: {reason}',
            category='trustee',
        )
        return Response({'detail': f'Trustee {target_email} marked as rejected.'})


class AdminTrusteeInvitationsView(APIView):
    """
    GET  /api/v1/admin/trustees/invitations/ — List all trustee invitations across platform with KPI counts
    POST /api/v1/admin/trustees/invitations/ — Dispatch a new trustee invitation from admin
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        invitations = Invitation.objects.select_related('owner', 'vault', 'trustee_profile').all().order_by('-sent_at')

        pending_count = invitations.filter(status='pending').count()
        accepted_count = invitations.filter(status='accepted').count()
        expired_count = invitations.filter(status='expired').count()
        cancelled_count = invitations.filter(status__in=['declined', 'revoked']).count()

        data = []
        for inv in invitations[:100]:
            status_display = inv.status.capitalize() if inv.status != 'revoked' else 'Cancelled'
            data.append({
                'id': str(inv.id),
                'recipient': inv.invitee_name or (inv.invitee_email.split('@')[0] if inv.invitee_email else 'Trustee Candidate'),
                'email': inv.invitee_email,
                'trusteeType': inv.relationship or 'Co-Trustee',
                'vault': inv.vault.name if inv.vault else 'Legacy Custody Vault',
                'invitedBy': (inv.owner.name or inv.owner.email) if inv.owner else 'Administrator',
                'ownerEmail': inv.owner.email if inv.owner else '',
                'sentOn': inv.sent_at.strftime('%d %b %Y'),
                'expiresOn': inv.expires_at.strftime('%d %b %Y') if inv.expires_at else 'In 14 Days',
                'status': status_display,
                'statusClass': 'cancelled' if inv.status == 'revoked' else inv.status.lower(),
                'message': inv.note or 'Nomination link for AegisVault custody protocol.',
                'token': inv.token,
            })

        return Response({
            'kpis': {
                'pending': pending_count,
                'accepted': accepted_count,
                'expired': expired_count,
                'cancelled': cancelled_count,
            },
            'invitations': data
        })

    def post(self, request):
        name = (request.data.get('name') or request.data.get('recipient') or '').strip()
        email = (request.data.get('email') or '').strip()
        trustee_type = request.data.get('trustee_type') or request.data.get('type') or 'Co-Trustee'
        vault_param = request.data.get('vault') or request.data.get('vault_id') or ''
        expiry_param = request.data.get('expiry') or request.data.get('expiry_days') or '14 Days'
        message = (request.data.get('message') or request.data.get('note') or '').strip()

        if not email:
            return Response({'error': 'Recipient email is required'}, status=status.HTTP_400_BAD_REQUEST)

        expiry_days = 14
        if '7' in str(expiry_param):
            expiry_days = 7
        elif '30' in str(expiry_param):
            expiry_days = 30

        owner = User.objects.filter(role='owner').first() or request.user

        vault = None
        if vault_param:
            vault = Vault.objects.filter(name__iexact=str(vault_param).strip()).first()
            if not vault:
                import uuid
                try:
                    v_uuid = uuid.UUID(str(vault_param).strip())
                    vault = Vault.objects.filter(id=v_uuid).first()
                except (ValueError, AttributeError):
                    pass
        if not vault:
            vault = Vault.objects.filter(owner=owner).first() or Vault.objects.first()

        if not vault:
            vault = Vault.objects.create(
                name='Primary Security Vault',
                owner=owner,
                vault_type='personal',
                status='active',
                required_shares=2,
                total_shares=3,
                encryption_algorithm='AES-256-GCM',
                description='Primary custody vault initialized by administrator'
            )

        profile, _ = TrusteeProfile.objects.get_or_create(
            owner=owner,
            email=email,
            defaults={
                'name': name or email.split('@')[0],
                'relationship': trustee_type,
                'status': 'Invited',
                'verification_status': 'Not Started',
            }
        )
        if name and profile.name != name:
            profile.name = name
            profile.save(update_fields=['name'])

        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            profile.user = existing_user
            profile.save(update_fields=['user'])

        invitation = Invitation.objects.create(
            owner=owner,
            trustee_profile=profile,
            invitee_name=name or email.split('@')[0],
            invitee_email=email,
            relationship=trustee_type,
            vault=vault,
            note=message or 'Nomination link for AegisVault custody protocol.',
            expires_at=timezone.now() + timedelta(days=expiry_days)
        )

        AuditService.log(
            user=request.user,
            action_key='admin_trustee_invitation_dispatched',
            action_title=f'Admin Dispatched Invitation: {email}',
            details=f'Admin dispatched invitation for {name} ({email}) assigned to vault "{vault.name}"',
            category='trustee',
            vault_name=vault.name,
        )

        email_sent, email_msg = TrusteeEmailService.send_trustee_invitation_email(invitation, request)

        return Response({
            'id': str(invitation.id),
            'recipient': invitation.invitee_name,
            'email': invitation.invitee_email,
            'trusteeType': invitation.relationship,
            'vault': vault.name,
            'invitedBy': owner.name or 'Admin',
            'ownerEmail': owner.email,
            'sentOn': invitation.sent_at.strftime('%d %b %Y'),
            'expiresOn': invitation.expires_at.strftime('%d %b %Y'),
            'status': 'Pending',
            'statusClass': 'pending',
            'message': invitation.note,
            'token': invitation.token,
            'email_sent': email_sent,
            'email_status': email_msg,
        }, status=status.HTTP_201_CREATED)


class AdminTrusteeInvitationResendView(APIView):
    """POST /api/v1/admin/trustees/invitations/{id}/resend/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        invitation = get_object_or_404(Invitation, pk=pk)

        invitation.token = secrets.token_urlsafe(64)
        invitation.token_used = False
        invitation.status = 'pending'
        invitation.sent_at = timezone.now()
        invitation.expires_at = timezone.now() + timedelta(days=14)
        invitation.save()

        email_sent, email_msg = TrusteeEmailService.send_trustee_invitation_email(invitation, request)

        AuditService.log(
            user=request.user,
            action_key='admin_invitation_resent',
            action_title=f'Invitation Resent: {invitation.invitee_email}',
            details=f'Admin re-dispatched invitation for {invitation.invitee_email}',
            category='trustee',
        )

        return Response({
            'detail': f'Invitation refreshed and dispatched to {invitation.invitee_email}.',
            'id': str(invitation.id),
            'status': 'Pending',
            'email_sent': email_sent,
            'email_status': email_msg,
        })


class AdminTrusteeInvitationCancelView(APIView):
    """POST /api/v1/admin/trustees/invitations/{id}/cancel/"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        invitation = get_object_or_404(Invitation, pk=pk)
        invitation.status = 'revoked'
        invitation.save(update_fields=['status'])

        if invitation.trustee_profile and not invitation.trustee_profile.user:
            invitation.trustee_profile.status = 'Removed'
            invitation.trustee_profile.verification_status = 'Revoked'
            invitation.trustee_profile.save(update_fields=['status', 'verification_status'])

        AuditService.log(
            user=request.user,
            action_key='admin_invitation_cancelled',
            action_title=f'Invitation Cancelled: {invitation.invitee_email}',
            details=f'Admin cancelled invitation #{invitation.id} for {invitation.invitee_name}',
            category='trustee',
        )

        return Response({'detail': f'Invitation for {invitation.invitee_name} has been cancelled.'})


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

        from django.utils import timezone
        data = []
        for log in logs.order_by('-timestamp')[:200]:
            local_ts = timezone.localtime(log.timestamp)
            action_code = (log.action_key or 'SYSTEM_EVENT').upper()
            status_display = log.status.capitalize() if log.status else 'Success'
            data.append({
                'id': f"LOG-{str(log.id)[:8].upper()}",
                'raw_id': str(log.id),
                'date': local_ts.strftime('%Y-%m-%d'),
                'time': local_ts.strftime('%I:%M:%S %p'),
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
                'timestamp': local_ts.strftime('%d %b %Y, %I:%M %p'),
                'dateSort': local_ts.isoformat(),
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
                    'timestamp': local_ts.isoformat()
                }
            })

        return Response(data)
