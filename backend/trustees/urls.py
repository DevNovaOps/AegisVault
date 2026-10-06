"""
AegisVault — Trustee URLs (Owner Panel)
Endpoints under /api/v1/owner/
"""
from django.urls import path
from .views import (
    TrusteeListCreateView, TrusteeDetailView,
    TrusteeRemindView, TrusteeRevokeView,
    InvitationListCreateView, InvitationResendView,
    InvitationRenewView, InvitationRevokeView,
)

urlpatterns = [
    # Trustees
    path('trustees/', TrusteeListCreateView.as_view(), name='trustee-list-create'),
    path('trustees/<uuid:pk>/', TrusteeDetailView.as_view(), name='trustee-detail'),
    path('trustees/<uuid:pk>/remind/', TrusteeRemindView.as_view(), name='trustee-remind'),
    path('trustees/<uuid:pk>/revoke/', TrusteeRevokeView.as_view(), name='trustee-revoke'),

    # Invitations
    path('invitations/', InvitationListCreateView.as_view(), name='invitation-list-create'),
    path('invitations/<uuid:pk>/resend/', InvitationResendView.as_view(), name='invitation-resend'),
    path('invitations/<uuid:pk>/renew/', InvitationRenewView.as_view(), name='invitation-renew'),
    path('invitations/<uuid:pk>/revoke/', InvitationRevokeView.as_view(), name='invitation-revoke'),
]
