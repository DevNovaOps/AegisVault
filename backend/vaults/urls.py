"""
AegisVault — Vault URL Configuration
Endpoints under /api/v1/owner/
"""
from django.urls import path
from .views import (
    VaultListCreateView, VaultDetailView,
    VaultLockView, VaultUnlockView,
    ShareListCreateView, ShareDetailView,
    ShareRemindView, ShareRestoreView, ShareRevokeView,
)

urlpatterns = [
    # Vaults
    path('vaults/', VaultListCreateView.as_view(), name='vault-list-create'),
    path('vaults/<uuid:pk>/', VaultDetailView.as_view(), name='vault-detail'),
    path('vaults/<uuid:pk>/lock/', VaultLockView.as_view(), name='vault-lock'),
    path('vaults/<uuid:pk>/unlock/', VaultUnlockView.as_view(), name='vault-unlock'),

    # Shares
    path('shares/', ShareListCreateView.as_view(), name='share-list-create'),
    path('shares/<uuid:pk>/', ShareDetailView.as_view(), name='share-detail'),
    path('shares/<uuid:pk>/remind/', ShareRemindView.as_view(), name='share-remind'),
    path('shares/<uuid:pk>/restore/', ShareRestoreView.as_view(), name='share-restore'),
    path('shares/<uuid:pk>/revoke/', ShareRevokeView.as_view(), name='share-revoke'),
]
