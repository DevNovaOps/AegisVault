"""
AegisVault — Trustee Panel URL Configuration
Endpoints under /api/v1/trustee/
"""
from django.urls import path
from .views_trustee import (
    TrusteeDashboardView, TrusteeInvitationsView,
    TrusteeAcceptInvitationView, TrusteeDeclineInvitationView,
    TrusteeAssignedVaultsView, TrusteeReleasesView,
    TrusteeShareSubmitView,
)

urlpatterns = [
    path('dashboard/', TrusteeDashboardView.as_view(), name='trustee-dashboard'),
    path('invitations/', TrusteeInvitationsView.as_view(), name='trustee-invitations'),
    path('invitations/<uuid:pk>/accept/', TrusteeAcceptInvitationView.as_view(), name='trustee-accept'),
    path('invitations/<uuid:pk>/decline/', TrusteeDeclineInvitationView.as_view(), name='trustee-decline'),
    path('assigned-vaults/', TrusteeAssignedVaultsView.as_view(), name='trustee-assigned-vaults'),
    path('releases/', TrusteeReleasesView.as_view(), name='trustee-releases'),
    path('shares/<uuid:pk>/submit/', TrusteeShareSubmitView.as_view(), name='trustee-share-submit'),
]
