"""
AegisVault — Security Views
Admin-only security overview, alerts, and event management.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminUser
from .services import SecurityService


class SecurityOverviewView(APIView):
    """GET /api/v1/admin/security/overview"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SecurityService.get_overview())


class SecurityAlertsView(APIView):
    """GET /api/v1/admin/security/alerts"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SecurityService.get_alerts())


class SecurityAccessView(APIView):
    """GET /api/v1/admin/security/access"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SecurityService.get_access_activity())


class SecurityIncidentsView(APIView):
    """GET/POST /api/v1/admin/security/incidents"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(SecurityService.get_incidents())

    def post(self, request):
        from audit.models import SecurityEvent
        from rest_framework import status

        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        severity = request.data.get('severity', 'high').lower()
        resource = request.data.get('resource', 'Security Operations').strip()

        if not title:
            return Response({'detail': 'Incident title is required.'}, status=status.HTTP_400_BAD_REQUEST)

        event = SecurityEvent.objects.create(
            user=request.user,
            event_type='suspicious_activity',
            severity=severity if severity in ['critical', 'high', 'medium', 'low'] else 'high',
            title=title,
            description=description or f'Incident registered by {request.user.name or request.user.email}',
            resource=resource,
            source_ip=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            is_resolved=False
        )

        return Response({
            'detail': 'Security incident created successfully.',
            'incident': {
                'id': f"INC-{str(event.id)[:8].upper()}",
                'raw_id': str(event.id),
                'title': event.title,
                'severity': event.severity.title(),
                'affectedArea': event.resource,
                'created': event.timestamp.strftime('%d %b %I:%M %p'),
                'status': 'Investigating',
                'description': event.description
            }
        }, status=status.HTTP_201_CREATED)

