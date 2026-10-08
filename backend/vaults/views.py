"""
AegisVault — Vault Views
Owner vault CRUD, share management, lock/unlock operations.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Sum
from django.conf import settings
from .models import Vault, VaultShare, VaultAsset
from .serializers import (
    VaultSerializer, VaultCreateSerializer,
    VaultShareSerializer, VaultShareCreateSerializer,
    VaultAssetSerializer
)
from accounts.permissions import IsOwner, IsVaultOwner
from accounts.models import User
from audit.services import AuditService
from notifications.services import NotificationService


class VaultListCreateView(APIView):
    """
    GET  /api/v1/owner/vaults       — List owner's vaults
    POST /api/v1/owner/vaults       — Create a new vault
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        vaults = Vault.objects.filter(owner=request.user)

        # Filtering from frontend query params
        status_filter = request.query_params.get('status')
        type_filter = request.query_params.get('type')
        search = request.query_params.get('search', '')

        if status_filter and status_filter != 'all':
            vaults = vaults.filter(status__iexact=status_filter)
        if type_filter and type_filter != 'all':
            vaults = vaults.filter(vault_type__iexact=type_filter)
        if search:
            vaults = vaults.filter(name__icontains=search)

        # Sorting
        sort_by = request.query_params.get('sort', 'updated')
        if sort_by == 'name':
            vaults = vaults.order_by('name')
        elif sort_by == 'trustees':
            vaults = vaults.order_by('-total_shares')
        else:
            vaults = vaults.order_by('-updated_at')

        serializer = VaultSerializer(vaults, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VaultCreateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        vault = serializer.save()

        AuditService.log(
            user=request.user,
            action_key='vault_created',
            action_title='Vault Created',
            details=f'Created vault "{vault.name}"',
            category='vault',
            vault_name=vault.name,
        )

        return Response(
            VaultSerializer(vault).data,
            status=status.HTTP_201_CREATED
        )


class VaultDetailView(APIView):
    """
    GET    /api/v1/owner/vaults/{id}   — Get vault details
    PUT    /api/v1/owner/vaults/{id}   — Update vault
    DELETE /api/v1/owner/vaults/{id}   — Delete vault
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get_object(self, pk, user):
        vault = get_object_or_404(Vault, pk=pk, owner=user)
        return vault

    def get(self, request, pk):
        vault = self.get_object(pk, request.user)
        return Response(VaultSerializer(vault).data)

    def put(self, request, pk):
        vault = self.get_object(pk, request.user)
        serializer = VaultCreateSerializer(vault, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        AuditService.log(
            user=request.user,
            action_key='vault_updated',
            action_title='Vault Updated',
            details=f'Updated vault "{vault.name}"',
            category='vault',
            vault_name=vault.name,
        )

        return Response(VaultSerializer(vault).data)

    def delete(self, request, pk):
        vault = self.get_object(pk, request.user)
        vault_name = vault.name
        vault.delete()

        AuditService.log(
            user=request.user,
            action_key='vault_deleted',
            action_title='Vault Deleted',
            details=f'Deleted vault "{vault_name}"',
            category='vault',
            vault_name=vault_name,
        )

        return Response(
            {'detail': f'Vault "{vault_name}" deleted.'},
            status=status.HTTP_204_NO_CONTENT
        )


class VaultLockView(APIView):
    """POST /api/v1/owner/vaults/{id}/lock"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        vault = get_object_or_404(Vault, pk=pk, owner=request.user)
        vault.status = Vault.VaultStatus.LOCKED
        vault.save(update_fields=['status', 'updated_at'])

        AuditService.log(
            user=request.user,
            action_key='vault_locked',
            action_title='Vault Locked',
            details=f'Vault "{vault.name}" locked',
            category='vault',
            vault_name=vault.name,
        )

        return Response(VaultSerializer(vault).data)


class VaultUnlockView(APIView):
    """POST /api/v1/owner/vaults/{id}/unlock"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        vault = get_object_or_404(Vault, pk=pk, owner=request.user)
        vault.status = Vault.VaultStatus.ACTIVE
        vault.save(update_fields=['status', 'updated_at'])

        AuditService.log(
            user=request.user,
            action_key='vault_unlocked',
            action_title='Vault Unlocked',
            details=f'Vault "{vault.name}" unlocked',
            category='vault',
            vault_name=vault.name,
        )

        return Response(VaultSerializer(vault).data)


# ─── Share Management Views ──────────────────────────────────────────────────

class ShareListCreateView(APIView):
    """
    GET  /api/v1/owner/shares     — List owner's shares
    POST /api/v1/owner/shares     — Share a vault with a trustee
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        shares = VaultShare.objects.filter(vault__owner=request.user)

        vault_filter = request.query_params.get('vault')
        access_filter = request.query_params.get('access')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search', '')

        if vault_filter and vault_filter != 'all':
            shares = shares.filter(vault__name__iexact=vault_filter)
        if access_filter and access_filter != 'all':
            shares = shares.filter(access_level__iexact=access_filter)
        if status_filter and status_filter != 'all':
            shares = shares.filter(status__iexact=status_filter)
        if search:
            shares = shares.filter(
                trustee__name__icontains=search
            ) | shares.filter(vault__name__icontains=search)

        serializer = VaultShareSerializer(shares.distinct(), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VaultShareCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vault = get_object_or_404(
            Vault, pk=serializer.validated_data['vault_id'], owner=request.user
        )
        trustee = get_object_or_404(
            User, email=serializer.validated_data['trustee_email']
        )

        share, created = VaultShare.objects.update_or_create(
            vault=vault,
            trustee=trustee,
            defaults={
                'access_level': serializer.validated_data['access_level'],
                'note': serializer.validated_data.get('note', ''),
                'expires_at': serializer.validated_data.get('expires_at'),
                'status': 'active',
            }
        )

        AuditService.log(
            user=request.user,
            action_key='share_created',
            action_title='Vault Shared',
            details=f'Shared "{vault.name}" with {trustee.name}',
            category='share',
            vault_name=vault.name,
        )

        NotificationService.create(
            user=trustee,
            notification_type='share',
            title=f'New vault access: {vault.name}',
            description=f'{request.user.name} shared "{vault.name}" with you.',
            vault_name=vault.name,
        )

        return Response(
            VaultShareSerializer(share).data,
            status=status.HTTP_201_CREATED
        )


class ShareDetailView(APIView):
    """PUT /api/v1/owner/shares/{id}"""
    permission_classes = [IsAuthenticated, IsOwner]

    def put(self, request, pk):
        share = get_object_or_404(VaultShare, pk=pk, vault__owner=request.user)
        serializer = VaultShareSerializer(share, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        AuditService.log(
            user=request.user,
            action_key='share_updated',
            action_title='Share Permissions Updated',
            details=f'Updated share for {share.trustee.name} on {share.vault.name}',
            category='share',
            vault_name=share.vault.name,
        )

        return Response(VaultShareSerializer(share).data)


class ShareRemindView(APIView):
    """POST /api/v1/owner/shares/{id}/remind"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        share = get_object_or_404(VaultShare, pk=pk, vault__owner=request.user)

        NotificationService.create(
            user=share.trustee,
            notification_type='share',
            title=f'Share acceptance reminder: {share.vault.name}',
            description=f'{request.user.name} is requesting you review your access to "{share.vault.name}".',
            vault_name=share.vault.name,
        )

        return Response({'detail': f'Reminder sent to {share.trustee.name}.'})


class ShareRestoreView(APIView):
    """POST /api/v1/owner/shares/{id}/restore"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        share = get_object_or_404(VaultShare, pk=pk, vault__owner=request.user)
        if share.status != 'revoked':
            return Response(
                {'detail': 'Only revoked shares can be restored.'},
                status=status.HTTP_409_CONFLICT
            )
        share.status = 'active'
        share.save(update_fields=['status', 'updated_at'])

        AuditService.log(
            user=request.user,
            action_key='share_restored',
            action_title='Share Restored',
            details=f'Restored share for {share.trustee.name} on {share.vault.name}',
            category='share',
            vault_name=share.vault.name,
        )

        return Response(VaultShareSerializer(share).data)


class ShareRevokeView(APIView):
    """POST /api/v1/owner/shares/{id}/revoke"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, pk):
        share = get_object_or_404(VaultShare, pk=pk, vault__owner=request.user)
        share.status = 'revoked'
        share.save(update_fields=['status', 'updated_at'])

        AuditService.log(
            user=request.user,
            action_key='share_revoked',
            action_title='Share Access Revoked',
            details=f'Revoked share for {share.trustee.name} on {share.vault.name}',
            category='share',
            vault_name=share.vault.name,
        )

        NotificationService.create(
            user=share.trustee,
            notification_type='share',
            title=f'Access revoked: {share.vault.name}',
            description=f'Your access to "{share.vault.name}" has been revoked.',
            vault_name=share.vault.name,
        )

        return Response(VaultShareSerializer(share).data)


# ─── Asset Management Views ──────────────────────────────────────────────────

class VaultAssetListCreateView(APIView):
    """
    GET  /api/v1/owner/vaults/{vault_id}/assets     — List assets in a vault
    POST /api/v1/owner/vaults/{vault_id}/assets     — Upload new asset
    """
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, vault_id):
        vault = get_object_or_404(Vault, pk=vault_id, owner=request.user)
        assets = VaultAsset.objects.filter(vault=vault)
        serializer = VaultAssetSerializer(assets, many=True)
        return Response(serializer.data)

    def post(self, request, vault_id):
        vault = get_object_or_404(Vault, pk=vault_id, owner=request.user)
        
        serializer = VaultAssetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Calculate file size if file is provided
        file_obj = request.FILES.get('file')
        file_size = file_obj.size if file_obj else 0
        
        # Enforce Quota
        total_used = VaultAsset.objects.filter(vault__owner=request.user).aggregate(Sum('file_size_bytes'))['file_size_bytes__sum'] or 0
        if total_used + file_size > getattr(settings, 'STORAGE_QUOTA', 10 * 1024 * 1024 * 1024):
            return Response({'detail': 'Storage quota exceeded.'}, status=status.HTTP_400_BAD_REQUEST)
        
        asset = serializer.save(
            vault=vault,
            file_size_bytes=file_size,
            mime_type=file_obj.content_type if file_obj else ''
        )

        # Update Vault storage used
        vault.storage_used_bytes += file_size
        vault.save(update_fields=['storage_used_bytes', 'updated_at'])

        AuditService.log(
            user=request.user,
            action_key='asset_uploaded',
            action_title='Asset Uploaded',
            details=f'Uploaded asset "{asset.name}" to "{vault.name}"',
            category='vault',
            vault_name=vault.name,
        )

        return Response(VaultAssetSerializer(asset).data, status=status.HTTP_201_CREATED)


class VaultAssetDetailView(APIView):
    """
    GET    /api/v1/owner/vaults/{vault_id}/assets/{asset_id}   — View asset details / download
    DELETE /api/v1/owner/vaults/{vault_id}/assets/{asset_id}   — Delete asset
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request, vault_id, pk):
        asset = get_object_or_404(VaultAsset, pk=pk, vault__id=vault_id, vault__owner=request.user)
        
        # In a real app with object storage, this would generate a signed URL
        # For now we just return metadata, or we could stream the file if requested.
        data = VaultAssetSerializer(asset).data
        if asset.file:
            data['download_url'] = request.build_absolute_uri(asset.file.url)
        elif asset.encrypted_data:
            data['decrypted_note'] = asset.encrypted_data # Fake decryption for now
            
        return Response(data)

    def delete(self, request, vault_id, pk):
        asset = get_object_or_404(VaultAsset, pk=pk, vault__id=vault_id, vault__owner=request.user)
        vault = asset.vault
        file_size = asset.file_size_bytes
        asset_name = asset.name
        
        asset.delete()
        
        vault.storage_used_bytes = max(0, vault.storage_used_bytes - file_size)
        vault.save(update_fields=['storage_used_bytes', 'updated_at'])
        
        AuditService.log(
            user=request.user,
            action_key='asset_deleted',
            action_title='Asset Deleted',
            details=f'Deleted asset "{asset_name}" from "{vault.name}"',
            category='vault',
            vault_name=vault.name,
        )
        return Response({'detail': 'Asset deleted.'}, status=status.HTTP_204_NO_CONTENT)


class StorageOverviewView(APIView):
    """
    GET /api/v1/owner/storage/overview
    """
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        used = VaultAsset.objects.filter(vault__owner=request.user).aggregate(Sum('file_size_bytes'))['file_size_bytes__sum'] or 0
        total = getattr(settings, 'STORAGE_QUOTA', 10 * 1024 * 1024 * 1024)
        
        return Response({
            'used_bytes': used,
            'total_bytes': total,
            'remaining_bytes': max(0, total - used),
            'usage_percentage': min(100, round((used / total) * 100)) if total > 0 else 0
        })
