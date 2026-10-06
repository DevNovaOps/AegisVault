"""
AegisVault — Admin Management URL Configuration
Endpoints under /api/v1/admin/
"""
from django.urls import path
from .views_admin_management import (
    AdminUserListView, AdminUserDetailView,
    AdminUserSuspendView, AdminUserActivateView,
    AdminVaultListView, AdminVaultDetailView,
    AdminTrusteeListView,
    AdminPendingActionsView,
    AdminAuditLogView,
)

urlpatterns = [
    # Users
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<uuid:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<uuid:pk>/suspend/', AdminUserSuspendView.as_view(), name='admin-user-suspend'),
    path('users/<uuid:pk>/activate/', AdminUserActivateView.as_view(), name='admin-user-activate'),

    # Vaults
    path('vaults/', AdminVaultListView.as_view(), name='admin-vaults-list'),
    path('vaults/<uuid:pk>/', AdminVaultDetailView.as_view(), name='admin-vault-detail'),

    # Trustees
    path('trustees/', AdminTrusteeListView.as_view(), name='admin-trustees-list'),

    # Pending Actions
    path('pending-actions/', AdminPendingActionsView.as_view(), name='admin-pending-actions'),

    # Audit Logs (platform-wide)
    path('audit/logs/', AdminAuditLogView.as_view(), name='admin-audit-logs'),
]
