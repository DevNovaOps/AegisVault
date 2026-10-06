"""
AegisVault — Heartbeat Views
Dead Man's Switch check-in, status, and configuration.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import HeartbeatConfig, HeartbeatLog
from accounts.permissions import IsOwner
from audit.services import AuditService
from notifications.services import NotificationService


class HeartbeatCheckinView(APIView):
    """POST /api/v1/owner/heartbeat/checkin — 'I'm Alive' button"""
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request):
        config, created = HeartbeatConfig.objects.get_or_create(
            owner=request.user,
            defaults={
                'interval_days': 30,
                'grace_period_days': 7,
            }
        )

        config.checkin()

        # Log the event
        HeartbeatLog.objects.create(
            config=config,
            event_type='checkin',
            details=f'Check-in from {self._get_ip(request)}',
            ip_address=self._get_ip(request),
        )

        AuditService.log(
            user=request.user,
            action_key='heartbeat_checkin',
            action_title='Heartbeat Check-in',
            details='Dead Man\'s Switch reset — owner confirmed alive',
            category='heartbeat',
            ip_address=self._get_ip(request),
        )

        return Response({
            'detail': 'Check-in successful. Dead Man\'s Switch reset.',
            'last_checkin': config.last_checkin.isoformat(),
            'next_deadline': config.next_deadline.isoformat(),
            'state': config.state,
            'total_checkins': config.total_checkins,
        })

    def _get_ip(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')


class HeartbeatStatusView(APIView):
    """GET /api/v1/owner/heartbeat/status"""
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        try:
            config = HeartbeatConfig.objects.get(owner=request.user)
        except HeartbeatConfig.DoesNotExist:
            return Response({
                'configured': False,
                'detail': 'Heartbeat not configured yet.',
            })

        recent_logs = HeartbeatLog.objects.filter(
            config=config
        ).order_by('-timestamp')[:10]

        return Response({
            'configured': True,
            'state': config.state,
            'interval_days': config.interval_days,
            'grace_period_days': config.grace_period_days,
            'last_checkin': config.last_checkin.isoformat(),
            'next_deadline': config.next_deadline.isoformat(),
            'grace_deadline': config.grace_deadline.isoformat() if config.grace_deadline else None,
            'total_checkins': config.total_checkins,
            'missed_count': config.missed_count,
            'remaining_seconds': config.remaining_seconds,
            'recent_logs': [
                {
                    'event_type': log.event_type,
                    'details': log.details,
                    'timestamp': log.timestamp.isoformat(),
                }
                for log in recent_logs
            ],
        })


class HeartbeatConfigView(APIView):
    """PUT /api/v1/owner/heartbeat/config"""
    permission_classes = [IsAuthenticated, IsOwner]

    def put(self, request):
        config, created = HeartbeatConfig.objects.get_or_create(
            owner=request.user,
            defaults={
                'interval_days': 30,
                'grace_period_days': 7,
            }
        )

        interval = request.data.get('interval_days')
        grace = request.data.get('grace_period_days')

        if interval is not None:
            config.interval_days = max(1, int(interval))
        if grace is not None:
            config.grace_period_days = max(1, int(grace))

        config.save()

        HeartbeatLog.objects.create(
            config=config,
            event_type='config_changed',
            details=f'Interval: {config.interval_days}d, Grace: {config.grace_period_days}d',
        )

        AuditService.log(
            user=request.user,
            action_key='heartbeat_config_changed',
            action_title='Heartbeat Configuration Changed',
            details=f'Interval set to {config.interval_days} days, grace period to {config.grace_period_days} days',
            category='heartbeat',
        )

        return Response({
            'detail': 'Heartbeat configuration updated.',
            'interval_days': config.interval_days,
            'grace_period_days': config.grace_period_days,
            'next_deadline': config.next_deadline.isoformat(),
        })
