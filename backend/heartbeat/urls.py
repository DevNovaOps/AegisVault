"""
AegisVault — Heartbeat URL Configuration
Endpoints under /api/v1/owner/heartbeat/
"""
from django.urls import path
from .views import HeartbeatCheckinView, HeartbeatStatusView, HeartbeatConfigView

urlpatterns = [
    path('heartbeat/checkin/', HeartbeatCheckinView.as_view(), name='heartbeat-checkin'),
    path('heartbeat/status/', HeartbeatStatusView.as_view(), name='heartbeat-status'),
    path('heartbeat/config/', HeartbeatConfigView.as_view(), name='heartbeat-config'),
]
