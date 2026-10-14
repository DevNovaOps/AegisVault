"""
AegisVault — Security URL Configuration
Endpoints under /api/v1/admin/security/
"""
from django.urls import path
from .views import (
    SecurityOverviewView, SecurityAlertsView,
    SecurityAccessView, SecurityIncidentsView
)

urlpatterns = [
    path('overview/', SecurityOverviewView.as_view(), name='security-overview'),
    path('alerts/', SecurityAlertsView.as_view(), name='security-alerts'),
    path('access/', SecurityAccessView.as_view(), name='security-access'),
    path('incidents/', SecurityIncidentsView.as_view(), name='security-incidents'),
]

