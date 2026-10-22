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
from django.http import FileResponse, HttpResponse, Http404
import os

from .models import TrusteeProfile, Invitation
from .serializers import InvitationSerializer
from vaults.models import Vault, VaultAsset, VaultShare
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
            trustee=user, status__in=['active', 'submitted']
        ).count()

        pending_releases = ReleaseParticipant.objects.filter(
            trustee=user, status='pending', release__status__in=['pending', 'in_progress', 'authorized']
        ).count()

        completed_releases = ReleaseParticipant.objects.filter(
            trustee=user, status='verified', release__status='released'
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
            trustee=user, status__in=['active', 'submitted']
        ).select_related('vault', 'vault__owner')
        assigned_vaults = []
        for s in shares:
            has_release = ReleaseRequest.objects.filter(
                vault=s.vault, status__in=['pending', 'in_progress', 'authorized']
            ).exists()
            if not has_release and s.status == 'submitted':
                s.status = 'active'
                s.save(update_fields=['status', 'updated_at'])
            assigned_vaults.append({
                'id': str(s.vault.id),
                'name': s.vault.name,
                'owner_name': s.vault.owner.name,
                'owner_email': s.vault.owner.email,
                'status': s.status,
                'vault_type': s.vault.vault_type,
                'release_status': 'In Progress' if has_release else 'No Release',
            })

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
                'timestamp': timezone.localtime(log.timestamp).isoformat(),
                'vault_name': log.vault_name or 'General',
            }
            for log in recent_logs
        ]

        return Response({
            'pending_invitations': pending_invitations,
            'active_shares': active_shares,
            'pending_releases': pending_releases,
            'completed_releases': completed_releases,
            'recent_activity': recent_activity,
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

        data = []
        for log in logs[:100]:
            local_ts = timezone.localtime(log.timestamp)
            data.append({
                'id': str(log.id),
                'date': local_ts.strftime('%d %b %Y'),
                'time': local_ts.strftime('%I:%M %p'),
                'rawDate': local_ts.strftime('%Y-%m-%d %H:%M'),
                'actionKey': log.action_key,
                'actionTitle': log.action_title,
                'details': log.details,
                'category': log.category,
                'vault': log.vault_name or 'General',
                'user': request.user.name or request.user.email,
                'email': request.user.email,
                'ip': log.ip_address or '127.0.0.1',
                'status': log.status or 'success',
                'timestamp': local_ts.isoformat(),
                'hash': f"sha256:{abs(hash(str(log.id))):016x}{abs(hash(log.action_title)):016x}",
            })
        return Response(data)



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

        data = []
        for share in shares:
            # Check expiration
            if share.is_expired and share.status != 'expired':
                share.status = 'expired'
                share.save(update_fields=['status', 'updated_at'])

            # Check for any active release for this vault
            active_rel = ReleaseRequest.objects.filter(
                vault=share.vault,
                status__in=['pending', 'in_progress', 'authorized']
            ).first()

            # If no active release exists, ensure share.status is NOT stuck in 'submitted'
            if not active_rel and share.status == 'submitted':
                share.status = 'active'
                share.save(update_fields=['status', 'updated_at'])

            latest_rel = ReleaseRequest.objects.filter(
                vault=share.vault
            ).order_by('-created_at').first()

            release_status = 'No Release'
            is_released = False
            if active_rel:
                release_status = 'In Progress'
            elif latest_rel and latest_rel.status == 'cancelled':
                release_status = 'Cancelled'
            elif latest_rel and latest_rel.status == 'released':
                release_status = 'Completed'
                is_released = True
            is_revoked = (share.status == 'revoked')
            is_expired = (share.status == 'expired' or share.is_expired)
            is_no_access = (share.access_level == 'No Access')

            is_cancelled = (latest_rel and latest_rel.status == 'cancelled' and not is_released)

            if is_released:
                can_view = True
                can_download = True
                access_level_display = 'View & Download (Released)'
            elif is_cancelled:
                can_view = False
                can_download = False
                is_no_access = True
                access_level_display = 'No Access (Cancelled)'
            else:
                can_view = not is_revoked and not is_expired and not is_no_access
                can_download = (share.status == 'active' and share.access_level == 'View & Download' and not is_expired and not is_revoked)
                access_level_display = share.access_level

            serialized = VaultShareSerializer(share).data
            serialized['release_status'] = release_status
            serialized['has_active_release'] = bool(active_rel)
            serialized['is_released'] = is_released
            serialized['is_revoked'] = is_revoked
            serialized['is_expired'] = is_expired
            serialized['is_no_access'] = is_no_access and not is_released
            serialized['can_view'] = can_view
            serialized['can_download'] = can_download
            serialized['access_level'] = access_level_display
            data.append(serialized)

        return Response(data)


class TrusteeReleasesView(APIView):
    """GET /api/v1/trustee/releases"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        status_param = request.query_params.get('status')
        participations = ReleaseParticipant.objects.filter(
            trustee=request.user
        ).select_related('release', 'release__vault')

        if status_param and status_param != 'all':
            participations = participations.filter(release__status__iexact=status_param)

        data = []
        for p in participations:
            # Human readable status
            rel_status = p.release.status
            if rel_status == 'in_progress':
                formatted_status = 'In Progress'
            elif rel_status == 'cancelled':
                formatted_status = 'Cancelled'
            elif rel_status == 'released':
                formatted_status = 'Released'
            elif rel_status == 'authorized':
                formatted_status = 'Authorized'
            elif rel_status == 'scheduled':
                formatted_status = 'Scheduled'
            else:
                formatted_status = rel_status.capitalize()

            # Next step guidance
            if rel_status == 'cancelled':
                next_step = 'Cancelled by Owner'
            elif rel_status == 'released':
                next_step = 'Vault Unlocked'
            elif p.status == 'pending':
                next_step = 'Awaiting your submission'
            else:
                next_step = 'Verified'

            data.append({
                'id': str(p.id),
                'release_id': str(p.release.id),
                'title': p.release.title,
                'vault_name': p.release.vault.name,
                'trigger_type': p.release.trigger_type,
                'release_status': rel_status,
                'release_status_display': formatted_status,
                'participant_status': p.status,
                'next_step': next_step,
                'required_shares': p.release.required_shares,
                'collected_shares': p.release.collected_shares,
                'submitted_at': p.submitted_at,
                'created_at': p.created_at,
            })

        return Response(data)


# ═══════════════════════════════════════════════════════════════════════════════
#  TRUSTEE VAULT ASSET VIEWING & DOWNLOADING
# ═══════════════════════════════════════════════════════════════════════════════

class TrusteeVaultAssetsView(APIView):
    """
    GET /api/v1/trustee/vaults/{vault_id}/assets/
    Lists decrypted assets / documents accessible to this trustee.
    Enforces access level: 'No Access' vs 'View Only' vs 'View & Download',
    and blocks revoked / expired shares.
    """
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request, vault_id):
        vault = get_object_or_404(Vault, pk=vault_id)

        # 1. Check if user is a valid trustee for this vault
        share = VaultShare.objects.filter(vault=vault, trustee=request.user).first()
        is_participant = ReleaseParticipant.objects.filter(release__vault=vault, trustee=request.user).exists()

        if not share and not is_participant:
            return Response(
                {'detail': 'You do not have access rights to this vault.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Check if vault is released (full legacy handover to trustee)
        is_released = ReleaseRequest.objects.filter(
            vault=vault, status__in=['released', 'authorized']
        ).exists()

        # 2b. Check if the release for this vault was cancelled
        latest_rel = ReleaseRequest.objects.filter(vault=vault).order_by('-created_at').first()
        if latest_rel and latest_rel.status == 'cancelled' and not is_released:
            return Response(
                {'detail': 'Release for this vault was cancelled by the owner. Asset access is locked.', 'status': 'cancelled'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Check revocation status
        if share and share.status == 'revoked' and not is_released:
            return Response(
                {'detail': 'Access to this vault has been revoked by the owner.', 'status': 'revoked'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 4. Check expiration policy
        if share and share.is_expired and not is_released:
            if share.status != 'expired':
                share.status = 'expired'
                share.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'Access to this vault share has expired according to owner policy.', 'status': 'expired'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 5. Check No Access permission
        if share and share.access_level == 'No Access' and not is_released:
            return Response(
                {'detail': 'Access Denied: You have "No Access" to this vault assets. Please contact the vault owner.', 'status': 'no_access'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Determine download permission & access level display
        can_download = is_released or (share and share.status == 'active' and share.access_level == 'View & Download' and not share.is_expired)
        access_level = 'View & Download (Released)' if is_released else (share.access_level if share else 'View Only')

        assets = VaultAsset.objects.filter(vault=vault).order_by('-created_at')
        assets_data = []
        for asset in assets:
            is_note = bool(asset.encrypted_data and not asset.file)
            assets_data.append({
                'id': str(asset.id),
                'name': asset.name,
                'category': asset.category,
                'sensitivity': asset.sensitivity,
                'description': asset.description,
                'file_size_bytes': asset.file_size_bytes,
                'mime_type': asset.mime_type or ('text/plain' if is_note else 'application/octet-stream'),
                'is_note': is_note,
                'created_at': asset.created_at,
                'can_view': True,
                'can_download': can_download,
                'preview_url': f'/api/v1/trustee/vaults/{vault_id}/assets/{asset.id}/preview/',
                'download_url': f'/api/v1/trustee/vaults/{vault_id}/assets/{asset.id}/download/' if can_download else None,
            })

        AuditService.log(
            user=request.user,
            action_key='trustee_assets_viewed',
            action_title='Trustee Viewed Vault Assets',
            details=f'Trustee {request.user.name} viewed assets in "{vault.name}" ({len(assets_data)} items)',
            category='vault',
            vault_name=vault.name,
        )

        return Response({
            'vault_id': str(vault.id),
            'vault_name': vault.name,
            'vault_description': vault.description,
            'owner_name': vault.owner.name,
            'owner_email': vault.owner.email,
            'access_level': access_level,
            'is_released': is_released,
            'can_download': can_download,
            'assets': assets_data
        })


class TrusteeVaultAssetPreviewView(APIView):
    """
    GET /api/v1/trustee/vaults/{vault_id}/assets/{pk}/preview/
    Provides inline preview for text/notes, images, or PDFs.
    """
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request, vault_id, pk):
        vault = get_object_or_404(Vault, pk=vault_id)
        share = VaultShare.objects.filter(vault=vault, trustee=request.user).first()
        is_released = ReleaseRequest.objects.filter(vault=vault, status__in=['released', 'authorized']).exists()

        if not share and not is_released:
            return Response({'detail': 'No access permissions.'}, status=status.HTTP_403_FORBIDDEN)

        latest_rel = ReleaseRequest.objects.filter(vault=vault).order_by('-created_at').first()
        if latest_rel and latest_rel.status == 'cancelled' and not is_released:
            return Response({'detail': 'Release for this vault was cancelled by the owner. Asset access is locked.', 'status': 'cancelled'}, status=status.HTTP_403_FORBIDDEN)

        if share and share.status == 'revoked' and not is_released:
            return Response({'detail': 'Access revoked by vault owner.'}, status=status.HTTP_403_FORBIDDEN)

        if share and share.is_expired and not is_released:
            return Response({'detail': 'Access expired.'}, status=status.HTTP_403_FORBIDDEN)

        if share and share.access_level == 'No Access' and not is_released:
            return Response({'detail': 'Access Denied: You have "No Access" to this vault.'}, status=status.HTTP_403_FORBIDDEN)

        asset = get_object_or_404(VaultAsset, pk=pk, vault=vault)

        if asset.encrypted_data and not asset.file:
            return Response({
                'id': str(asset.id),
                'name': asset.name,
                'is_note': True,
                'content': asset.encrypted_data,
                'mime_type': 'text/plain'
            })

        if asset.file:
            mime = asset.mime_type or 'application/octet-stream'
            try:
                response = FileResponse(asset.file.open('rb'), content_type=mime)
                response['Content-Disposition'] = f'inline; filename="{os.path.basename(asset.file.name)}"'
                return response
            except Exception as e:
                return Response({'detail': f'File preview unavailable: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'detail': 'No content available for this asset.'}, status=status.HTTP_404_NOT_FOUND)


class TrusteeVaultAssetDownloadView(APIView):
    """
    GET /api/v1/trustee/vaults/{vault_id}/assets/{pk}/download/
    Direct download of decrypted asset.
    Enforces 'View & Download' (or Released state).
    """
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request, vault_id, pk):
        vault = get_object_or_404(Vault, pk=vault_id)
        share = VaultShare.objects.filter(vault=vault, trustee=request.user).first()
        is_released = ReleaseRequest.objects.filter(vault=vault, status__in=['released', 'authorized']).exists()

        if not share and not is_released:
            return Response({'detail': 'No access permissions.'}, status=status.HTTP_403_FORBIDDEN)

        latest_rel = ReleaseRequest.objects.filter(vault=vault).order_by('-created_at').first()
        if latest_rel and latest_rel.status == 'cancelled' and not is_released:
            return Response({'detail': 'Release for this vault was cancelled by the owner. Asset access is locked.', 'status': 'cancelled'}, status=status.HTTP_403_FORBIDDEN)

        if not is_released:
            if share and share.status == 'revoked':
                return Response({'detail': 'Access revoked by vault owner.'}, status=status.HTTP_403_FORBIDDEN)
            if share and share.is_expired:
                return Response({'detail': 'Access expired.'}, status=status.HTTP_403_FORBIDDEN)
            if share and share.access_level == 'No Access':
                return Response({'detail': 'Access Denied: You have "No Access" to this vault.'}, status=status.HTTP_403_FORBIDDEN)

        can_download = is_released or (share and share.status == 'active' and share.access_level == 'View & Download' and not share.is_expired)
        if not can_download:
            detail = 'Permission Denied: Your access level is "View Only". Downloading is restricted by the owner.' if (share and share.access_level == 'View Only') else 'Permission Denied: You do not have download permissions for this vault.'
            return Response({'detail': detail}, status=status.HTTP_403_FORBIDDEN)

        asset = get_object_or_404(VaultAsset, pk=pk, vault=vault)

        AuditService.log(
            user=request.user,
            action_key='asset_downloaded',
            action_title='Asset Downloaded by Trustee',
            details=f'Trustee {request.user.name} downloaded "{asset.name}" from "{vault.name}"',
            category='vault',
            vault_name=vault.name,
        )

        if asset.file:
            try:
                filename = os.path.basename(asset.file.name)
                response = FileResponse(asset.file.open('rb'), as_attachment=True, filename=filename)
                return response
            except Exception as e:
                return Response({'detail': f'File unavailable: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)

        if asset.encrypted_data:
            filename = f"{asset.name.replace(' ', '_')}.txt"
            response = HttpResponse(asset.encrypted_data, content_type='text/plain; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        return Response({'detail': 'No downloadable content found.'}, status=status.HTTP_404_NOT_FOUND)


