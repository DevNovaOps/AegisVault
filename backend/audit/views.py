"""
AegisVault — Audit Views
Audit logs for owners, and security operations for admins.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsOwner, IsAdminUser
from .models import AuditLog, SecurityEvent


class OwnerAuditLogView(APIView):
    """GET /api/v1/owner/audit/logs"""
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        logs = AuditLog.objects.filter(user=request.user)

        # Filtering
        cat_filter = request.query_params.get('category')
        search = request.query_params.get('search', '')
        date_range = request.query_params.get('dateRange')

        if cat_filter and cat_filter != 'all':
            logs = logs.filter(category__iexact=cat_filter)
        if search:
            logs = logs.filter(action_title__icontains=search) | \
                   logs.filter(details__icontains=search)

        # Sort
        logs = logs.order_by('-timestamp')

        data = [
            {
                'id': str(log.id),
                'date': log.timestamp.strftime('%Y-%m-%d'),
                'time': log.timestamp.strftime('%H:%M:%S'),
                'actionKey': log.action_key,
                'actionTitle': log.action_title,
                'details': log.details,
                'category': log.category,
                'vault': log.vault_name,
                'ip': log.ip_address,
                'status': log.status,
                'timestamp': log.timestamp.isoformat(),
            }
            for log in logs[:100]  # Limit to 100 for performance
        ]
        return Response(data)


# ─── Admin Views ─────────────────────────────────────────────────────────────

class AdminSecurityEventsView(APIView):
    """GET /api/v1/admin/security/events"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        events = SecurityEvent.objects.all().order_by('-timestamp')

        sev_filter = request.query_params.get('severity')
        type_filter = request.query_params.get('type')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search', '')

        if sev_filter and sev_filter != 'all':
            events = events.filter(severity__iexact=sev_filter)
        if type_filter and type_filter != 'all':
            events = events.filter(event_type__iexact=type_filter)
        if status_filter == 'resolved':
            events = events.filter(is_resolved=True)
        elif status_filter == 'open':
            events = events.filter(is_resolved=False)
        if search:
            events = events.filter(title__icontains=search)

        data = [
            {
                'id': str(e.id),
                'event_type': e.event_type,
                'severity': e.severity,
                'title': e.title,
                'description': e.description,
                'source_ip': e.source_ip,
                'resource': e.resource,
                'is_resolved': e.is_resolved,
                'user_email': e.user.email if e.user else 'Unknown',
                'timestamp': e.timestamp.isoformat(),
            }
            for e in events[:200]
        ]
        return Response(data)


class AdminResolveSecurityEventView(APIView):
    """POST /api/v1/admin/security/events/{id}/resolve"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        from django.shortcuts import get_object_or_404
        from django.utils import timezone
        from .services import AuditService

        event = get_object_or_404(SecurityEvent, pk=pk)

        if event.is_resolved:
            return Response(
                {'detail': 'Event is already resolved.'},
                status=status.HTTP_409_CONFLICT
            )

        event.is_resolved = True
        event.resolved_at = timezone.now()
        event.resolved_by = request.user
        event.save(update_fields=['is_resolved', 'resolved_at', 'resolved_by'])

        AuditService.log(
            user=request.user,
            action_key='security_event_resolved',
            action_title='Security Alert Resolved',
            details=f'Admin resolved event: {event.title}',
            category='admin',
        )

        return Response({'detail': f'Event {event.id} marked as resolved.'})
