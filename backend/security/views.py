"""
AegisVault — Security Views
Admin-only security overview, alerts, and event management.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminUser
from .services import SecurityService


class SecurityOverviewView(APIView):
    """GET /api/v1/admin/security/overview"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SecurityService.get_overview())


class SecurityAlertsView(APIView):
    """GET /api/v1/admin/security/alerts"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SecurityService.get_alerts())
