"""
AegisVault — Support URL Configuration
Endpoints under /api/v1/owner/support/
"""
from django.urls import path
from .views import SupportTicketCreateView

urlpatterns = [
    path('tickets/', SupportTicketCreateView.as_view(), name='support-tickets'),
]
