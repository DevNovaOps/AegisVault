"""
AegisVault — Admin Dashboard URL Configuration
Endpoints under /api/v1/admin/dashboard/
"""
from django.urls import path
from .views import AdminDashboardStatsView, AdminDashboardChartDataView

urlpatterns = [
    path('stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('chart-data/', AdminDashboardChartDataView.as_view(), name='admin-dashboard-chart'),
]
