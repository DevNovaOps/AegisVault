"""
AegisVault — Notification Views
List, read status toggling, bulk operations, and preference management.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Notification, NotificationPreference


class NotificationSerializer:
    """Inline serializer matching frontend notifications.js expected data."""
    @staticmethod
    def to_dict(notification):
        return {
            'id': str(notification.id),
            'type': notification.notification_type,
            'title': notification.title,
            'description': notification.description,
            'vault_name': notification.vault_name,
            'status': notification.status,
            'created_at': notification.created_at.isoformat(),
        }


class NotificationListView(APIView):
    """GET /api/v1/owner/notifications"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:50]  # Limit to 50 most recent

        # Filter by type if provided
        type_filter = request.query_params.get('type')
        if type_filter and type_filter != 'all':
            notifications = notifications.filter(notification_type=type_filter)

        return Response([NotificationSerializer.to_dict(n) for n in notifications])


class NotificationMarkReadView(APIView):
    """POST /api/v1/owner/notifications/{id}/mark-read"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(
            Notification, pk=pk, user=request.user
        )
        notification.status = Notification.NotificationStatus.READ
        notification.save(update_fields=['status'])

        return Response(NotificationSerializer.to_dict(notification))


class NotificationBulkReadView(APIView):
    """POST /api/v1/owner/notifications/bulk-read"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'detail': 'No IDs provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Notification.objects.filter(
            id__in=ids,
            user=request.user,
            status=Notification.NotificationStatus.UNREAD
        ).update(status=Notification.NotificationStatus.READ)

        return Response({'detail': f'Marked {len(ids)} notifications as read.'})


class NotificationMarkAllReadView(APIView):
    """POST /api/v1/owner/notifications/mark-all-read"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            user=request.user,
            status=Notification.NotificationStatus.UNREAD
        ).update(status=Notification.NotificationStatus.READ)

        return Response({'detail': f'Marked {updated} notifications as read.'})


class NotificationPreferencesView(APIView):
    """
    GET /api/v1/owner/notifications/preferences
    PUT /api/v1/owner/notifications/preferences
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        return Response(self._to_dict(prefs))

    def put(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)

        data = request.data
        fields = [
            'email_enabled', 'push_enabled', 'sms_enabled',
            'invitation_alerts', 'trustee_alerts', 'heartbeat_alerts',
            'release_alerts', 'security_alerts', 'system_alerts'
        ]

        for field in fields:
            if field in data:
                setattr(prefs, field, data[field])

        prefs.save()
        return Response(self._to_dict(prefs))

    def _to_dict(self, prefs):
        return {
            'email_enabled': prefs.email_enabled,
            'push_enabled': prefs.push_enabled,
            'sms_enabled': prefs.sms_enabled,
            'invitation_alerts': prefs.invitation_alerts,
            'trustee_alerts': prefs.trustee_alerts,
            'heartbeat_alerts': prefs.heartbeat_alerts,
            'release_alerts': prefs.release_alerts,
            'security_alerts': prefs.security_alerts,
            'system_alerts': prefs.system_alerts,
        }
