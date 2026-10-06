"""
AegisVault — Notification URL Configuration
Endpoints under /api/v1/owner/notifications/
"""
from django.urls import path
from .views import (
    NotificationListView, NotificationMarkReadView,
    NotificationBulkReadView, NotificationMarkAllReadView,
    NotificationPreferencesView
)

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/bulk-read/', NotificationBulkReadView.as_view(), name='notification-bulk-read'),
    path('notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('notifications/preferences/', NotificationPreferencesView.as_view(), name='notification-preferences'),
    path('notifications/<uuid:pk>/mark-read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
]
