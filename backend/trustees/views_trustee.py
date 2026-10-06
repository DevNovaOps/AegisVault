"""
AegisVault — Trustee Panel Views
Trustee-facing endpoints: dashboard, invitations, assigned vaults, releases
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
from accounts.permissions import IsTrustee
from audit.services import AuditService
from notifications.services import NotificationService


class TrusteeDashboardView(APIView):
    """GET /api/v1/trustee/dashboard"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        user = request.user

        # Pending invitations
        pending_invitations = Invitation.objects.filter(
            invitee_email=user.email, status='pending'
        ).count()

        # Assigned vaults (active shares)
        active_shares = VaultShare.objects.filter(
            trustee=user, status='active'
        ).count()

        # Pending release participations
        pending_releases = ReleaseParticipant.objects.filter(
            trustee=user, status='pending'
        ).count()

        # Completed releases
        completed_releases = ReleaseParticipant.objects.filter(
            trustee=user, status='verified'
        ).count()

        return Response({
            'pending_invitations': pending_invitations,
            'active_shares': active_shares,
            'pending_releases': pending_releases,
            'completed_releases': completed_releases,
        })


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


class TrusteeAssignedVaultsView(APIView):
    """GET /api/v1/trustee/assigned-vaults"""
    permission_classes = [IsAuthenticated, IsTrustee]

    def get(self, request):
        shares = VaultShare.objects.filter(
            trustee=request.user
        ).select_related('vault')
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
        participant = get_object_or_404(
            ReleaseParticipant, pk=pk, trustee=request.user
        )

        if participant.status != 'pending':
            return Response(
                {'detail': 'Share already submitted or declined.'},
                status=status.HTTP_409_CONFLICT
            )

        participant.status = 'submitted'
        participant.submitted_at = timezone.now()
        participant.save()

        # Increment collected shares on release
        release = participant.release
        release.collected_shares += 1
        release.save(update_fields=['collected_shares'])

        # Check K-of-N threshold
        release.check_threshold()

        AuditService.log(
            user=request.user,
            action_key='share_submitted',
            action_title='Share Submitted for Release',
            details=f'{request.user.name} submitted shard for "{release.title}"',
            category='release',
            vault_name=release.vault.name,
        )

        return Response({
            'detail': 'Share submitted successfully.',
            'release_status': release.status,
            'collected': release.collected_shares,
            'required': release.required_shares,
        })
