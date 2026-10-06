"""
AegisVault — System Health Views
Admin-only infrastructure health monitoring endpoints.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminUser
from .services import SystemHealthService


class SystemHealthSummaryView(APIView):
    """GET /api/v1/admin/system-health/summary"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SystemHealthService.get_summary())


class SystemHealthServicesView(APIView):
    """GET /api/v1/admin/system-health/services"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SystemHealthService.get_all_services())
