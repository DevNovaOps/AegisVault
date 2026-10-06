"""
AegisVault — Owner Audit URL Configuration
Endpoints under /api/v1/owner/audit/
"""
from django.urls import path
from .views import OwnerAuditLogView

urlpatterns = [
    path('logs/', OwnerAuditLogView.as_view(), name='owner-audit-logs'),
]
