"""
AegisVault — Owner Dashboard URL Configuration
Endpoints under /api/v1/owner/dashboard/
"""
from django.urls import path
from .views import OwnerDashboardKPIView, OwnerDashboardActivityView

urlpatterns = [
    path('kpis/', OwnerDashboardKPIView.as_view(), name='owner-dashboard-kpis'),
    path('activity/', OwnerDashboardActivityView.as_view(), name='owner-dashboard-activity'),
]
