"""
AegisVault — Reports URL Configuration
Endpoints under /api/v1/admin/reports/
"""
from django.urls import path
from .views import (
    AuditSummaryReportView, UserReportView, VaultReportView,
    SecurityReportView, ComplianceReportView
)

urlpatterns = [
    path('audit-summary/', AuditSummaryReportView.as_view(), name='report-audit-summary'),
    path('users/', UserReportView.as_view(), name='report-users'),
    path('vaults/', VaultReportView.as_view(), name='report-vaults'),
    path('security/', SecurityReportView.as_view(), name='report-security'),
    path('compliance/', ComplianceReportView.as_view(), name='report-compliance'),
]
