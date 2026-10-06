"""
AegisVault — Security URL Configuration
Endpoints under /api/v1/admin/security/
"""
from django.urls import path
from .views import SecurityOverviewView, SecurityAlertsView

urlpatterns = [
    path('overview/', SecurityOverviewView.as_view(), name='security-overview'),
    path('alerts/', SecurityAlertsView.as_view(), name='security-alerts'),
]
