"""
AegisVault — Trustee Views (Owner Panel)
Owner-facing trustee management and invitation endpoints.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import TrusteeProfile, Invitation
from .serializers import (
    TrusteeProfileSerializer, TrusteeCreateSerializer, TrusteeEditSerializer,
    InvitationSerializer, InvitationCreateSerializer,
)
from vaults.models import Vault
from accounts.permissions import IsOwner
from accounts.models import User
from audit.services import AuditService
from notifications.services import NotificationService


# ─── Trustee Management ──────────────────────────────────────────────────────

class TrusteeListCreateView(APIView):
    """
    GET  /api/v1/owner/trustees     — List owner's trustees
    POST /api/v1/owner/trustees     — Add/invite a new trustee
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        trustees = TrusteeProfile.objects.filter(owner=request.user)

        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status')
        relationship_filter = request.query_params.get('relationship')

        if search:
            trustees = trustees.filter(name__icontains=search) | \
                       trustees.filter(email__icontains=search)
        if status_filter and status_filter != 'all':
            # Map frontend filter values to model fields
            if status_filter in ('verified', 'pending', 'not started'):
                trustees = trustees.filter(verification_status__iexact=status_filter)
            elif status_filter == 'invited':
                trustees = trustees.filter(status='Invited')
        if relationship_filter and relationship_filter != 'all':
            trustees = trustees.filter(relationship__iexact=relationship_filter)

        serializer = TrusteeProfileSerializer(trustees.distinct(), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TrusteeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        vault = get_object_or_404(Vault, pk=data['vault_id'], owner=request.user)

        # Create trustee profile
        trustee_profile, created = TrusteeProfile.objects.get_or_create(
            owner=request.user,
            email=data['email'],
            defaults={
                'name': data['name'],
                'relationship': data['relationship'],
                'status': 'Invited',
                'verification_status': 'Not Started',
            }
        )

        # Link to user account if one exists
        try:
            user = User.objects.get(email=data['email'])
            trustee_profile.user = user
            trustee_profile.save()
        except User.DoesNotExist:
            pass

        # Create invitation
        invitation = Invitation.objects.create(
            owner=request.user,
            trustee_profile=trustee_profile,
            invitee_name=data['name'],
            invitee_email=data['email'],
            relationship=data['relationship'],
            vault=vault,
        )

        AuditService.log(
            user=request.user,
            action_key='trustee_invited',
            action_title='Trustee Invited',
            details=f'Invited {data["name"]} ({data["email"]}) as trustee for {vault.name}',
            category='trustee',
            vault_name=vault.name,
        )

        return Response(
            TrusteeProfileSerializer(trustee_profile).data,
            status=status.HTTP_201_CREATED
        )


class TrusteeDetailView(APIView):
    """
    PUT  /api/v1/owner/trustees/{id}     — Edit trustee
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def put(self, request, pk):
        trustee = get_object_or_404(
            TrusteeProfile, pk=pk, owner=request.user
        )
        serializer = TrusteeEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for field, value in serializer.validated_data.items():
            setattr(trustee, field, value)
        trustee.save()

        AuditService.log(
            user=request.user,
            action_key='trustee_updated',
            action_title='Trustee Updated',
            details=f'Updated trustee profile for {trustee.name}',
            category='trustee',
        )

        return Response(TrusteeProfileSerializer(trustee).data)


class TrusteeRemindView(APIView):
    """POST /api/v1/owner/trustees/{id}/remind"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        trustee = get_object_or_404(
            TrusteeProfile, pk=pk, owner=request.user
        )

        if trustee.user:
            NotificationService.create(
                user=trustee.user,
                notification_type='trustee',
                title='Verification reminder',
                description=f'{request.user.name} is requesting you complete your trustee verification.',
            )

        return Response({
            'detail': f'Verification reminder dispatched to {trustee.email}.'
        })


class TrusteeRevokeView(APIView):
    """POST /api/v1/owner/trustees/{id}/revoke"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        trustee = get_object_or_404(
            TrusteeProfile, pk=pk, owner=request.user
        )
        trustee.status = 'Removed'
        trustee.verification_status = 'Revoked'
        trustee.save(update_fields=['status', 'verification_status', 'updated_at'])

        # Revoke all active shares for this trustee
        if trustee.user:
            from vaults.models import VaultShare
            VaultShare.objects.filter(
                vault__owner=request.user,
                trustee=trustee.user,
                status='active'
            ).update(status='revoked')

        AuditService.log(
            user=request.user,
            action_key='trustee_revoked',
            action_title='Trustee Revoked',
            details=f'Revoked trustee access for {trustee.name}',
            category='trustee',
        )

        return Response(TrusteeProfileSerializer(trustee).data)


# ─── Invitation Management ───────────────────────────────────────────────────

class InvitationListCreateView(APIView):
    """
    GET  /api/v1/owner/invitations     — List owner's invitations
    POST /api/v1/owner/invitations     — Send new invitation
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        invitations = Invitation.objects.filter(owner=request.user)

        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status')
        vault_filter = request.query_params.get('vault')

        if search:
            invitations = invitations.filter(invitee_name__icontains=search) | \
                          invitations.filter(invitee_email__icontains=search)
        if status_filter and status_filter != 'all':
            invitations = invitations.filter(status__iexact=status_filter)
        if vault_filter and vault_filter != 'all':
            invitations = invitations.filter(vault__name__iexact=vault_filter)

        serializer = InvitationSerializer(invitations.distinct(), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InvitationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        vault = get_object_or_404(Vault, pk=data['vault_id'], owner=request.user)

        invitation = Invitation.objects.create(
            owner=request.user,
            invitee_name=data['invitee_name'],
            invitee_email=data['invitee_email'],
            relationship=data.get('relationship', ''),
            vault=vault,
            note=data.get('note', ''),
        )

        AuditService.log(
            user=request.user,
            action_key='invitation_sent',
            action_title='Invitation Sent',
            details=f'Invitation sent to {data["invitee_name"]} for {vault.name}',
            category='trustee',
            vault_name=vault.name,
        )

        NotificationService.create(
            user=request.user,
            notification_type='invitation',
            title=f'Invitation sent to {data["invitee_name"]}',
            description=f'Trustee invitation sent for {vault.name}.',
            vault_name=vault.name,
        )

        return Response(
            InvitationSerializer(invitation).data,
            status=status.HTTP_201_CREATED
        )


class InvitationResendView(APIView):
    """POST /api/v1/owner/invitations/{id}/resend"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        invitation = get_object_or_404(
            Invitation, pk=pk, owner=request.user
        )
        # Regenerate token and reset expiry
        import secrets
        from datetime import timedelta
        from django.conf import settings

        invitation.token = secrets.token_urlsafe(64)
        invitation.token_used = False
        invitation.expires_at = timezone.now() + timedelta(
            days=getattr(settings, 'AEGIS_INVITATION_EXPIRY_DAYS', 14)
        )
        invitation.sent_at = timezone.now()
        invitation.save()

        AuditService.log(
            user=request.user,
            action_key='invitation_resent',
            action_title='Invitation Resent',
            details=f'Fresh invitation link sent to {invitation.invitee_email}',
            category='trustee',
            vault_name=invitation.vault.name,
        )

        return Response({
            'detail': f'Fresh invitation link sent to {invitation.invitee_email}.',
            'invitation': InvitationSerializer(invitation).data,
        })


class InvitationRenewView(APIView):
    """POST /api/v1/owner/invitations/{id}/renew"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        invitation = get_object_or_404(
            Invitation, pk=pk, owner=request.user
        )
        import secrets
        from datetime import timedelta
        from django.conf import settings

        invitation.status = 'pending'
        invitation.token = secrets.token_urlsafe(64)
        invitation.token_used = False
        invitation.expires_at = timezone.now() + timedelta(
            days=getattr(settings, 'AEGIS_INVITATION_EXPIRY_DAYS', 14)
        )
        invitation.sent_at = timezone.now()
        invitation.save()

        AuditService.log(
            user=request.user,
            action_key='invitation_renewed',
            action_title='Invitation Renewed',
            details=f'Expired invitation renewed for {invitation.invitee_email}',
            category='trustee',
            vault_name=invitation.vault.name,
        )

        return Response({
            'detail': f'Invitation re-activated and sent to {invitation.invitee_email}.',
            'invitation': InvitationSerializer(invitation).data,
        })


class InvitationRevokeView(APIView):
    """POST /api/v1/owner/invitations/{id}/revoke"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        invitation = get_object_or_404(
            Invitation, pk=pk, owner=request.user
        )
        invitation.status = 'revoked'
        invitation.token_used = True
        invitation.save(update_fields=['status', 'token_used'])

        AuditService.log(
            user=request.user,
            action_key='invitation_revoked',
            action_title='Invitation Revoked',
            details=f'Invitation for {invitation.invitee_name} revoked',
            category='trustee',
            vault_name=invitation.vault.name,
        )

        return Response({
            'detail': f'Invitation for {invitation.invitee_name} revoked.',
            'invitation': InvitationSerializer(invitation).data,
        })
