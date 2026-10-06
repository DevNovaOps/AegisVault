"""
AegisVault — Reports Views
Admin-only report generation endpoints.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminUser
from .services import ReportService


class AuditSummaryReportView(APIView):
    """GET /api/v1/admin/reports/audit-summary?days=30"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(ReportService.generate_audit_summary(days))


class UserReportView(APIView):
    """GET /api/v1/admin/reports/users"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(ReportService.generate_user_report())


class VaultReportView(APIView):
    """GET /api/v1/admin/reports/vaults"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(ReportService.generate_vault_report())


class SecurityReportView(APIView):
    """GET /api/v1/admin/reports/security?days=30"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(ReportService.generate_security_report(days))


class ComplianceReportView(APIView):
    """GET /api/v1/admin/reports/compliance"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(ReportService.generate_compliance_report())
