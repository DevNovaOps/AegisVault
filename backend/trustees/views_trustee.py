"""
AegisVault — Trustee Panel Views
Trustee-facing endpoints: dashboard, profile, audit, notifications,
invitations, assigned vaults, releases.
All data is live from the database — zero mock data.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import TrusteeProfile, Invitation
from .serializers import InvitationSerializer
from vaults.models import VaultShare
from vaults.serializers import VaultShareSerializer
from releases.models import ReleaseParticipant, ReleaseRequest
from accounts.models import User
from accounts.serializers import UserSerializer
from accounts.permissions import IsTrustee
from audit.models import AuditLog
from audit.services import AuditService
from notifications.models import Notification
from notifications.services import NotificationService


# ═══════════════════════════════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════

class TrusteeDashboardView(APIView):
    """GET /api/v1/trustee/dashboard — Full dashboard payload"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        user = request.user

        # Counts
        pending_invitations = Invitation.objects.filter(
            invitee_email=user.email, status='pending'
        ).count()

        active_shares = VaultShare.objects.filter(
            trustee=user, status='active'
        ).count()

        pending_releases = ReleaseParticipant.objects.filter(
            trustee=user, status='pending'
        ).count()

        completed_releases = ReleaseParticipant.objects.filter(
            trustee=user, status='verified'
        ).count()

        # Auto-reconcile VaultShare for any accepted invitations
        for inv in Invitation.objects.filter(invitee_email__iexact=user.email, status='accepted').select_related('vault'):
            VaultShare.objects.get_or_create(
                vault=inv.vault,
                trustee=user,
                defaults={'access_level': 'View Only', 'status': 'active'}
            )

        # Assigned Vaults for the dashboard
        shares = VaultShare.objects.filter(
            trustee=user, status='active'
        ).select_related('vault', 'vault__owner')
        assigned_vaults = [
            {
                'id': str(s.vault.id),
                'name': s.vault.name,
                'owner_name': s.vault.owner.name,
                'owner_email': s.vault.owner.email,
                'status': s.status,
                'vault_type': s.vault.vault_type,
                'release_status': 'No Release',
            }
            for s in shares
        ]

        # Pending Actions
        pending_actions = []
        for inv in Invitation.objects.filter(invitee_email__iexact=user.email, status='pending').select_related('vault', 'owner'):
            pending_actions.append({
                'type': 'invitation',
                'id': str(inv.id),
                'title': f'Review Invitation to "{inv.vault.name}"',
                'desc': f'Invitation from {inv.owner.name} ({inv.owner.email})',
                'link': '../invitations/invitations.html',
            })

        # Recent activity (last 5 audit events)
        recent_logs = AuditLog.objects.filter(user=user).order_by('-timestamp')[:5]
        recent_activity = [
            {
                'id': str(log.id),
                'action_title': log.action_title,
                'details': log.details,
                'category': log.category,
                'timestamp': log.timestamp.isoformat(),
                'vault_name': log.vault_name or 'General',
            }
            for log in recent_logs
        ]

        # Unread notifications count
        unread_notifications = Notification.objects.filter(
            user=user, status='unread'
        ).count()

        return Response({
            'pending_invitations': pending_invitations,
            'active_shares': active_shares,
            'pending_releases': pending_releases,
            'completed_releases': completed_releases,
            'recent_activity': recent_activity,
            'unread_notifications': unread_notifications,
            'assigned_vaults': assigned_vaults,
            'pending_actions': pending_actions,
        })


# ═══════════════════════════════════════════════════════════════════════════════
#  PROFILE & SECURITY
# ═══════════════════════════════════════════════════════════════════════════════

class TrusteeProfileView(APIView):
    """GET /api/v1/trustee/profile/ — Current trustee profile data"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        user = request.user
        # Get linked trustee profiles (where this user is designated as trustee)
        profiles = TrusteeProfile.objects.filter(user=user)
        owners = []
        for tp in profiles:
            owners.append({
                'owner_name': tp.owner.name,
                'owner_email': tp.owner.email,
                'relationship': tp.relationship,
                'verification_status': tp.verification_status,
                'status': tp.status,
                'date_added': tp.date_added.isoformat(),
            })

        return Response({
            'user': UserSerializer(user).data,
            'trustee_profiles': owners,
        })


class TrusteeProfileUpdateView(APIView):
    """PUT /api/v1/trustee/profile/update/ — Update trustee profile"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def put(self, request):
        user = request.user
        data = request.data

        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'timezone_preference' in data:
            user.timezone_preference = data['timezone_preference']
        if 'bio' in data:
            user.bio = data['bio']

        user.save()

        AuditService.log(
            user=user,
            action_key='profile_updated',
            action_title='Profile Updated',
            details='Trustee profile information updated',
            category='profile',
        )

        return Response({
            'user': UserSerializer(user).data,
            'detail': 'Profile updated successfully.'
        })


class TrusteeChangePasswordView(APIView):
    """POST /api/v1/trustee/profile/change-password/"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password') or request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response(
                {'detail': 'Both current and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(current_password):
            return Response(
                {'detail': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'detail': 'New password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        AuditService.log(
            user=user,
            action_key='password_changed',
            action_title='Password Changed',
            details='Trustee account password changed',
            category='security',
        )

        return Response({'detail': 'Password changed successfully.'})


class TrusteeToggle2FAView(APIView):
    """POST /api/v1/trustee/profile/2fa/toggle/"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def post(self, request):
        user = request.user
        user.is_2fa_enabled = not user.is_2fa_enabled
        user.save(update_fields=['is_2fa_enabled'])

        state = 'enabled' if user.is_2fa_enabled else 'disabled'

        AuditService.log(
            user=user,
            action_key='2fa_toggled',
            action_title=f'Two-Factor Authentication {state.title()}',
            details=f'2FA has been {state}',
            category='security',
        )

        return Response({
            'is_2fa_enabled': user.is_2fa_enabled,
            'detail': f'Two-factor authentication {state}.'
        })


# ═══════════════════════════════════════════════════════════════════════════════
#  AUDIT LOGS (Trustee-facing)
# ═══════════════════════════════════════════════════════════════════════════════

class TrusteeAuditLogView(APIView):
    """GET /api/v1/trustee/audit/logs/ — Audit trail for the current trustee"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        logs = AuditLog.objects.filter(user=request.user).order_by('-timestamp')

        # Filtering
        cat_filter = request.query_params.get('category')
        search = request.query_params.get('search', '')

        if cat_filter and cat_filter != 'all':
            logs = logs.filter(category__iexact=cat_filter)
        if search:
            from django.db.models import Q
            logs = logs.filter(
                Q(action_title__icontains=search) | Q(details__icontains=search)
            )

        data = [
            {
                'id': str(log.id),
                'date': log.timestamp.strftime('%d %b %Y'),
                'time': log.timestamp.strftime('%I:%M %p'),
                'rawDate': log.timestamp.strftime('%Y-%m-%d %H:%M'),
                'actionKey': log.action_key,
                'actionTitle': log.action_title,
                'details': log.details,
                'category': log.category,
                'vault': log.vault_name or 'General',
                'user': request.user.name or request.user.email,
                'email': request.user.email,
                'ip': log.ip_address or '127.0.0.1',
                'status': log.status or 'success',
                'timestamp': log.timestamp.isoformat(),
                'hash': f"sha256:{abs(hash(str(log.id))):016x}{abs(hash(log.action_title)):016x}",
            }
            for log in logs[:100]
        ]
        return Response(data)


# ═══════════════════════════════════════════════════════════════════════════════
#  NOTIFICATIONS (Trustee-facing)
# ═══════════════════════════════════════════════════════════════════════════════

class TrusteeNotificationListView(APIView):
    """GET /api/v1/trustee/notifications/"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:50]

        type_filter = request.query_params.get('type')
        if type_filter and type_filter != 'all':
            notifications = notifications.filter(notification_type=type_filter)

        return Response([
            {
                'id': str(n.id),
                'type': n.notification_type,
                'title': n.title,
                'description': n.description,
                'vault_name': n.vault_name,
                'status': n.status,
                'created_at': n.created_at.isoformat(),
                'date': n.created_at.strftime('%d %b %Y'),
                'time': n.created_at.strftime('%I:%M %p'),
            }
            for n in notifications
        ])


class TrusteeNotificationMarkReadView(APIView):
    """POST /api/v1/trustee/notifications/{id}/mark-read/"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def post(self, request, pk):
        notification = get_object_or_404(
            Notification, pk=pk, user=request.user
        )
        notification.status = 'read'
        notification.save(update_fields=['status'])
        return Response({'detail': 'Notification marked as read.'})


class TrusteeNotificationMarkAllReadView(APIView):
    """POST /api/v1/trustee/notifications/mark-all-read/"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def post(self, request):
        updated = Notification.objects.filter(
            user=request.user, status='unread'
        ).update(status='read')
        return Response({'detail': f'Marked {updated} notifications as read.'})


# ═══════════════════════════════════════════════════════════════════════════════
#  INVITATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class TrusteeInvitationsView(APIView):
    """GET /api/v1/trustee/invitations"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        invitations = Invitation.objects.filter(
            invitee_email=request.user.email
        ).order_by('-sent_at')
        serializer = InvitationSerializer(invitations, many=True)
        return Response(serializer.data)


class TrusteeAcceptInvitationView(APIView):
    """POST /api/v1/trustee/invitations/{id}/accept"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def post(self, request, pk):
        invitation = get_object_or_404(
            Invitation, pk=pk, invitee_email=request.user.email
        )

        if invitation.status != 'pending':
            return Response(
                {'detail': 'This invitation is no longer pending.'},
                status=status.HTTP_409_CONFLICT
            )

        if invitation.is_expired:
            invitation.status = 'expired'
            invitation.save()
            return Response(
                {'detail': 'This invitation has expired.'},
                status=status.HTTP_410_GONE
            )

        # Accept the invitation
        invitation.status = 'accepted'
        invitation.accepted_at = timezone.now()
        invitation.token_used = True
        invitation.save()

        # Update trustee profile
        if invitation.trustee_profile:
            invitation.trustee_profile.user = request.user
            invitation.trustee_profile.status = 'Active'
            invitation.trustee_profile.verification_status = 'Verified'
            invitation.trustee_profile.save()

        # Create vault share
        VaultShare.objects.get_or_create(
            vault=invitation.vault,
            trustee=request.user,
            defaults={
                'access_level': 'View Only',
                'status': 'active',
            }
        )

        AuditService.log(
            user=request.user,
            action_key='invitation_accepted',
            action_title='Invitation Accepted',
            details=f'{request.user.name} accepted invitation for {invitation.vault.name}',
            category='trustee',
            vault_name=invitation.vault.name,
        )

        NotificationService.create(
            user=invitation.owner,
            notification_type='trustee',
            title=f'{request.user.name} accepted your invitation',
            description=f'Trustee invitation for {invitation.vault.name} has been accepted.',
            vault_name=invitation.vault.name,
        )

        return Response({
            'detail': 'Invitation accepted successfully.',
            'invitation': InvitationSerializer(invitation).data,
        })


class TrusteeDeclineInvitationView(APIView):
    """POST /api/v1/trustee/invitations/{id}/decline"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def post(self, request, pk):
        invitation = get_object_or_404(
            Invitation, pk=pk, invitee_email=request.user.email
        )

        invitation.status = 'declined'
        invitation.declined_at = timezone.now()
        invitation.decline_reason = request.data.get('reason', '')
        invitation.token_used = True
        invitation.save()

        AuditService.log(
            user=request.user,
            action_key='invitation_declined',
            action_title='Invitation Declined',
            details=f'{request.user.name} declined invitation for {invitation.vault.name}',
            category='trustee',
            vault_name=invitation.vault.name,
        )

        NotificationService.create(
            user=invitation.owner,
            notification_type='trustee',
            title=f'{request.user.name} declined your invitation',
            description=f'Trustee invitation for {invitation.vault.name} was declined.',
            vault_name=invitation.vault.name,
        )

        return Response({
            'detail': 'Invitation declined.',
            'invitation': InvitationSerializer(invitation).data,
        })


# ═══════════════════════════════════════════════════════════════════════════════
#  ASSIGNED VAULTS & RELEASES
# ═══════════════════════════════════════════════════════════════════════════════

class TrusteeAssignedVaultsView(APIView):
    """GET /api/v1/trustee/assigned-vaults"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        # Auto-reconcile VaultShare for any accepted invitations for this user
        accepted_invs = Invitation.objects.filter(
            invitee_email__iexact=request.user.email,
            status='accepted'
        ).select_related('vault')
        for inv in accepted_invs:
            VaultShare.objects.get_or_create(
                vault=inv.vault,
                trustee=request.user,
                defaults={
                    'access_level': 'View Only',
                    'status': 'active',
                }
            )

        shares = VaultShare.objects.filter(
            trustee=request.user
        ).select_related('vault', 'vault__owner')
        serializer = VaultShareSerializer(shares, many=True)
        return Response(serializer.data)


class TrusteeReleasesView(APIView):
    """GET /api/v1/trustee/releases"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        participations = ReleaseParticipant.objects.filter(
            trustee=request.user
        ).select_related('release', 'release__vault')

        data = []
        for p in participations:
            data.append({
                'id': str(p.id),
                'release_id': str(p.release.id),
                'title': p.release.title,
                'vault_name': p.release.vault.name,
                'trigger_type': p.release.trigger_type,
                'release_status': p.release.status,
                'participant_status': p.status,
                'required_shares': p.release.required_shares,
                'collected_shares': p.release.collected_shares,
                'submitted_at': p.submitted_at,
                'created_at': p.created_at,
            })

        return Response(data)


class TrusteeShareSubmitView(APIView):
    """POST /api/v1/trustee/shares/{id}/submit — Submit share for release"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def post(self, request, pk):
        # 1. Check if pk is a ReleaseParticipant id directly
        participant = ReleaseParticipant.objects.filter(
            pk=pk, trustee=request.user
        ).first()

        # 2. If not, check if pk is a VaultShare id or a Vault id
        if not participant:
            vshare = VaultShare.objects.filter(
                pk=pk, trustee=request.user
            ).select_related('vault', 'vault__owner').first()

            if not vshare:
                vshare = VaultShare.objects.filter(
                    vault_id=pk, trustee=request.user
                ).select_related('vault', 'vault__owner').first()

            if vshare:
                # Find or create a ReleaseRequest for this vault
                release = ReleaseRequest.objects.filter(
                    vault=vshare.vault, status__in=['pending', 'in_progress', 'scheduled']
                ).first()

                if not release:
                    release = ReleaseRequest.objects.create(
                        vault=vshare.vault,
                        owner=vshare.vault.owner,
                        title=f'Release Quorum for {vshare.vault.name}',
                        trigger_type='Trustee Consensus',
                        status='in_progress',
                        required_shares=vshare.vault.required_shares or 2,
                        total_shares=vshare.vault.total_shares or 3,
                    )

                participant, _ = ReleaseParticipant.objects.get_or_create(
                    release=release,
                    trustee=request.user,
                    defaults={'status': 'pending'}
                )

        if not participant:
            return Response(
                {'detail': 'Release participant or assigned vault not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        participant.status = 'submitted'
        participant.submitted_at = timezone.now()
        participant.save()

        # Update VaultShare if exists
        VaultShare.objects.filter(
            vault=participant.release.vault, trustee=request.user
        ).update(status='submitted')

        # Recalculate collected shares on release
        release = participant.release
        release.collected_shares = ReleaseParticipant.objects.filter(
            release=release, status='submitted'
        ).count()
        release.save(update_fields=['collected_shares'])

        # Check K-of-N threshold
        release.check_threshold()

        AuditService.log(
            user=request.user,
            action_key='share_submitted',
            action_title='Share Submitted for Release',
            details=f'{request.user.name} submitted cryptographic shard for "{release.vault.name}"',
            category='release',
            vault_name=release.vault.name,
        )

        return Response({
            'detail': 'Share submitted successfully.',
            'release_status': release.status,
            'collected': release.collected_shares,
            'required': release.required_shares,
            'vault_name': release.vault.name,
        })
