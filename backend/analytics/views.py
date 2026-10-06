"""
AegisVault — Analytics Views
Admin platform analytics: overview, user growth, vault activity, distributions.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminUser
from .services import AnalyticsService


class AnalyticsOverviewView(APIView):
    """GET /api/v1/admin/analytics/overview"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(AnalyticsService.get_overview_metrics())


class UserGrowthView(APIView):
    """GET /api/v1/admin/analytics/user-growth?period=6m"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', '6m')
        return Response(AnalyticsService.get_user_growth(period))


class VaultActivityView(APIView):
    """GET /api/v1/admin/analytics/vault-activity?period=6m"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', '6m')
        return Response(AnalyticsService.get_vault_activity(period))


class UserRoleDistributionView(APIView):
    """GET /api/v1/admin/analytics/user-roles"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(AnalyticsService.get_user_role_distribution())


class VaultCategoriesView(APIView):
    """GET /api/v1/admin/analytics/vault-categories"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(AnalyticsService.get_vault_categories())
