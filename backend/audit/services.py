"""
AegisVault — Audit Service
Centralized audit logging with tamper-evident hash chain.
"""
import hashlib
import json
import logging
from django.utils import timezone

logger = logging.getLogger('aegisvault')


class AuditService:
    """
    Service for creating immutable audit log entries.
    Every security-relevant action must be recorded here.
    """

    @staticmethod
    def log(user=None, action_key='', action_title='', details='',
            category='system', vault_name='', status='success',
            ip_address=None, user_agent=''):
        """Create an audit log entry with tamper-evident hash chain."""
        from audit.models import AuditLog

        # Get previous entry hash for chain
        previous_entry = AuditLog.objects.order_by('-timestamp').first()
        previous_hash = previous_entry.entry_hash if previous_entry else '0' * 64

        entry = AuditLog(
            user=user,
            action_key=action_key,
            action_title=action_title,
            details=details,
            category=category,
            vault_name=vault_name,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            previous_hash=previous_hash,
            timestamp=timezone.now(),
        )

        # Compute hash of this entry for tamper evidence
        hash_input = json.dumps({
            'prev': previous_hash,
            'user': str(user.id) if user else 'system',
            'action': action_key,
            'details': details,
            'ts': entry.timestamp.isoformat(),
        }, sort_keys=True)
        entry.entry_hash = hashlib.sha256(hash_input.encode()).hexdigest()

        entry.save()

        logger.info(
            f"AUDIT [{category}] {action_title}: {details} "
            f"(user={user.email if user else 'system'})"
        )

        return entry

    @staticmethod
    def log_security_event(user=None, event_type='', severity='medium',
                           title='', description='', source_ip=None, resource=''):
        """Create a security event for admin monitoring."""
        from audit.models import SecurityEvent

        event = SecurityEvent.objects.create(
            user=user,
            event_type=event_type,
            severity=severity,
            title=title,
            description=description,
            source_ip=source_ip,
            resource=resource,
        )

        logger.warning(
            f"SECURITY [{severity}] {title}: {description} "
            f"(ip={source_ip})"
        )

        return event
