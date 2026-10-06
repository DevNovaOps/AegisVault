"""
AegisVault — Admin Security URL Configuration
Endpoints under /api/v1/admin/security/
"""
from django.urls import path
from .views import AdminSecurityEventsView, AdminResolveSecurityEventView

urlpatterns = [
    path('events/', AdminSecurityEventsView.as_view(), name='admin-security-events'),
    path('events/<uuid:pk>/resolve/', AdminResolveSecurityEventView.as_view(), name='admin-security-resolve'),
]
