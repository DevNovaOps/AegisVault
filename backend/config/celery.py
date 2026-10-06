"""
AegisVault Backend — Celery Application
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('aegisvault')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# ─── Periodic Beat Schedule ──────────────────────────────────────────────────
app.conf.beat_schedule = {
    # Check heartbeats every 15 minutes
    'check-heartbeat-status': {
        'task': 'heartbeat.tasks.check_all_heartbeats',
        'schedule': crontab(minute='*/15'),
    },
    # Process grace period expirations every 15 minutes
    'process-grace-periods': {
        'task': 'heartbeat.tasks.process_grace_periods',
        'schedule': crontab(minute='*/15'),
    },
    # Check invitation expirations every hour
    'expire-stale-invitations': {
        'task': 'trustees.tasks.expire_stale_invitations',
        'schedule': crontab(minute=0),
    },
    # Process pending releases every 30 minutes
    'process-pending-releases': {
        'task': 'releases.tasks.process_pending_releases',
        'schedule': crontab(minute='*/30'),
    },
    # Send heartbeat reminder notifications daily at 9 AM UTC
    'send-heartbeat-reminders': {
        'task': 'heartbeat.tasks.send_heartbeat_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
    # Cleanup old notification records weekly
    'cleanup-old-notifications': {
        'task': 'notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=3, minute=0, day_of_week=0),
    },
}
