"""
AegisVault — System Health URL Configuration
Endpoints under /api/v1/admin/system-health/
"""
from django.urls import path
from .views import SystemHealthSummaryView, SystemHealthServicesView, SystemHealthTelemetryView

urlpatterns = [
    path('summary/', SystemHealthSummaryView.as_view(), name='system-health-summary'),
    path('services/', SystemHealthServicesView.as_view(), name='system-health-services'),
    path('telemetry/', SystemHealthTelemetryView.as_view(), name='system-health-telemetry'),
]
