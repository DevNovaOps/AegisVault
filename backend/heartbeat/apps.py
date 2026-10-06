from django.apps import AppConfig


class HeartbeatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'heartbeat'
    verbose_name = 'Heartbeat & Dead Man\'s Switch'
