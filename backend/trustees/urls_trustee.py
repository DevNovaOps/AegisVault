"""
AegisVault — Trustee Panel URL Configuration
Endpoints under /api/v1/trustee/
Complete trustee API: dashboard, profile, audit, notifications, invitations, releases.
"""
from django.urls import path
from .views_trustee import (
    TrusteeDashboardView, TrusteeInvitationsView,
    TrusteeAcceptInvitationView, TrusteeDeclineInvitationView,
    TrusteeAssignedVaultsView, TrusteeReleasesView,
    TrusteeProfileView, TrusteeProfileUpdateView,
    TrusteeChangePasswordView, TrusteeToggle2FAView,
    TrusteeAuditLogView,
    TrusteeVaultAssetsView, TrusteeVaultAssetPreviewView,
    TrusteeVaultAssetDownloadView,
)

urlpatterns = [
    # Dashboard
    path('dashboard/', TrusteeDashboardView.as_view(), name='trustee-dashboard'),

    # Profile & Security
    path('profile/', TrusteeProfileView.as_view(), name='trustee-profile'),
    path('profile/update/', TrusteeProfileUpdateView.as_view(), name='trustee-profile-update'),
    path('profile/change-password/', TrusteeChangePasswordView.as_view(), name='trustee-change-password'),
    path('profile/2fa/toggle/', TrusteeToggle2FAView.as_view(), name='trustee-toggle-2fa'),

    # Audit Logs
    path('audit/logs/', TrusteeAuditLogView.as_view(), name='trustee-audit-logs'),

    # Invitations
    path('invitations/', TrusteeInvitationsView.as_view(), name='trustee-invitations'),
    path('invitations/<uuid:pk>/accept/', TrusteeAcceptInvitationView.as_view(), name='trustee-accept'),
    path('invitations/<uuid:pk>/decline/', TrusteeDeclineInvitationView.as_view(), name='trustee-decline'),

    # Assigned Vaults
    path('assigned-vaults/', TrusteeAssignedVaultsView.as_view(), name='trustee-assigned-vaults'),
    path('vaults/<uuid:vault_id>/assets/', TrusteeVaultAssetsView.as_view(), name='trustee-vault-assets'),
    path('vaults/<uuid:vault_id>/assets/<uuid:pk>/preview/', TrusteeVaultAssetPreviewView.as_view(), name='trustee-vault-asset-preview'),
    path('vaults/<uuid:vault_id>/assets/<uuid:pk>/download/', TrusteeVaultAssetDownloadView.as_view(), name='trustee-vault-asset-download'),

    # Releases
    path('releases/', TrusteeReleasesView.as_view(), name='trustee-releases'),
]
