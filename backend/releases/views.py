"""
AegisVault — Release Views
Release management CRUD, cancel, and K-of-N orchestration.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import ReleaseRequest, ReleaseParticipant, SecretShare
from vaults.models import Vault
from accounts.permissions import IsOwner
from accounts.models import User
from audit.services import AuditService
from notifications.services import NotificationService


class ReleaseSerializer:
    """Inline serializer for release data matching frontend structure."""

    @staticmethod
    def to_dict(release):
        participants = release.participants.select_related('trustee').all()
        return {
            'id': str(release.id),
            'title': release.title,
            'description': release.description,
            'vault_id': str(release.vault.id),
            'vault_name': release.vault.name,
            'trigger_type': release.trigger_type,
            'trigger_detail': release.trigger_detail,
            'status': release.status,
            'note': release.note,
            'required_shares': release.required_shares,
            'total_shares': release.total_shares,
            'collected_shares': release.collected_shares,
            'scheduled_at': release.scheduled_at.isoformat() if release.scheduled_at else None,
            'triggered_at': release.triggered_at.isoformat() if release.triggered_at else None,
            'created_at': release.created_at.isoformat(),
            'participants': [
                {
                    'id': str(p.id),
                    'trustee_name': p.trustee.name,
                    'trustee_email': p.trustee.email,
                    'status': p.status,
                    'submitted_at': p.submitted_at.isoformat() if p.submitted_at else None,
                }
                for p in participants
            ],
        }


class ReleaseListCreateView(APIView):
    """
    GET  /api/v1/owner/releases     — List owner's releases
    POST /api/v1/owner/releases     — Create new release
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        releases = ReleaseRequest.objects.filter(
            owner=request.user
        ).select_related('vault')

        status_filter = request.query_params.get('status')
        trigger_filter = request.query_params.get('trigger')
        search = request.query_params.get('search', '')

        if status_filter and status_filter != 'all':
            releases = releases.filter(status__iexact=status_filter)
        if trigger_filter and trigger_filter != 'all':
            releases = releases.filter(trigger_type__iexact=trigger_filter)
        if search:
            releases = releases.filter(title__icontains=search)

        data = [ReleaseSerializer.to_dict(r) for r in releases]
        return Response(data)

    def post(self, request):
        vault = get_object_or_404(
            Vault,
            pk=request.data.get('vault_id'),
            owner=request.user
        )

        release = ReleaseRequest.objects.create(
            vault=vault,
            owner=request.user,
            title=request.data.get('title', ''),
            description=request.data.get('description', ''),
            trigger_type=request.data.get('trigger_type', 'Upon Inactivity'),
            trigger_detail=request.data.get('trigger_detail', ''),
            status=request.data.get('status', 'scheduled'),
            note=request.data.get('note', ''),
            required_shares=request.data.get('required_shares', vault.required_shares),
            total_shares=request.data.get('total_shares', vault.total_shares),
            scheduled_at=request.data.get('scheduled_at'),
        )

        # Add participants from trustee emails if provided
        trustee_emails = request.data.get('trustee_emails', [])
        for email in trustee_emails:
            try:
                trustee = User.objects.get(email=email, role='trustee')
                ReleaseParticipant.objects.create(
                    release=release, trustee=trustee
                )
            except User.DoesNotExist:
                pass

        AuditService.log(
            user=request.user,
            action_key='release_created',
            action_title='Release Created',
            details=f'Created release "{release.title}" for vault {vault.name}',
            category='release',
            vault_name=vault.name,
        )

        return Response(
            ReleaseSerializer.to_dict(release),
            status=status.HTTP_201_CREATED
        )


class ReleaseDetailView(APIView):
    """
    GET /api/v1/owner/releases/{id}
    PUT /api/v1/owner/releases/{id}
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request, pk):
        release = get_object_or_404(ReleaseRequest, pk=pk, owner=request.user)
        return Response(ReleaseSerializer.to_dict(release))

    def put(self, request, pk):
        release = get_object_or_404(ReleaseRequest, pk=pk, owner=request.user)

        for field in ['title', 'description', 'trigger_type', 'trigger_detail',
                      'note', 'required_shares', 'total_shares', 'scheduled_at']:
            if field in request.data:
                setattr(release, field, request.data[field])

        release.save()

        AuditService.log(
            user=request.user,
            action_key='release_updated',
            action_title='Release Updated',
            details=f'Updated release "{release.title}"',
            category='release',
            vault_name=release.vault.name,
        )

        return Response(ReleaseSerializer.to_dict(release))


class ReleaseCancelView(APIView):
    """POST /api/v1/owner/releases/{id}/cancel"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        release = get_object_or_404(ReleaseRequest, pk=pk, owner=request.user)

        if not release.cancel():
            return Response(
                {'detail': f'Cannot cancel release in "{release.status}" state.'},
                status=status.HTTP_409_CONFLICT
            )

        AuditService.log(
            user=request.user,
            action_key='release_cancelled',
            action_title='Release Cancelled',
            details=f'Cancelled release "{release.title}"',
            category='release',
            vault_name=release.vault.name,
        )

        return Response(ReleaseSerializer.to_dict(release))
