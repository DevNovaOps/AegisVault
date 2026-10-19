"""
AegisVault — Owner Dashboard URL Configuration
Endpoints under /api/v1/owner/dashboard/
"""
from django.urls import path
from .views import OwnerDashboardKPIView, OwnerDashboardActivityView, OwnerDashboardChartDataView

urlpatterns = [
    path('kpis/', OwnerDashboardKPIView.as_view(), name='owner-dashboard-kpis'),
    path('activity/', OwnerDashboardActivityView.as_view(), name='owner-dashboard-activity'),
    path('chart-data/', OwnerDashboardChartDataView.as_view(), name='owner-dashboard-chart-data'),
]
