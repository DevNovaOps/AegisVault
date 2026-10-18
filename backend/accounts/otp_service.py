"""
AegisVault — Accounts: 2FA Email OTP Service
Handles cryptographic generation, email dispatching, expiration, and validation.
"""
import secrets
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailOTP
from audit.services import AuditService

logger = logging.getLogger('aegisvault')


class OTPService:
    OTP_EXPIRY_MINUTES = 5

    @staticmethod
    def mask_email(email):
        """Masks an email for security display: j***e@domain.com"""
        if not email or '@' not in email:
            return email
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            masked_local = local[0] + '***'
        else:
            masked_local = local[0] + '***' + local[-1]
        return f"{masked_local}@{domain}"

    @classmethod
    def generate_and_send_otp(cls, user, request=None):
        """
        Generates a 6-digit numeric OTP code and temporary session token,
        invalidates previous unused codes, dispatches the email,
        and logs to the audit trail & console.
        """
        # Invalidate previous unused codes for this user
        EmailOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Generate cryptographically secure 6-digit code
        code = f"{secrets.randbelow(900000) + 100000}"
        temp_token = secrets.token_urlsafe(48)
        expires_at = timezone.now() + timedelta(minutes=cls.OTP_EXPIRY_MINUTES)

        otp = EmailOTP.objects.create(
            user=user,
            code=code,
            temp_token=temp_token,
            expires_at=expires_at
        )

        ip = cls._get_ip(request) if request else None

        # Email Body
        subject = f"[AegisVault] Your 2FA Verification Code: {code}"
        message = (
            f"Hello {user.name or 'AegisVault User'},\n\n"
            f"Your AegisVault two-factor authentication (2FA) verification code is:\n\n"
            f"=========================================\n"
            f"             {code}\n"
            f"=========================================\n\n"
            f"This code will expire in {cls.OTP_EXPIRY_MINUTES} minutes.\n"
            f"Enter this code on the authentication screen to complete your sign in.\n\n"
            f"If you did not request this login code, someone may have compromised your password. "
            f"Please update your master security credentials immediately.\n\n"
            f"— AegisVault Security Operations Protocol"
        )

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@aegisvault.com')

        # Send Email (fail silently if SMTP is not configured or offline)
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[user.email],
                fail_silently=True
            )
        except Exception as e:
            logger.warning(f"Failed to send 2FA email to {user.email}: {e}")

        # Always log to server console and logger for local development visibility
        print(f"\n=======================================================")
        print(f" [AEGISVAULT 2FA OTP] Code: {code} for user: {user.email}")
        print(f" Temp Token: {temp_token}")
        print(f" Expires At: {expires_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"=======================================================\n", flush=True)

        logger.info(f"[2FA OTP] Dispatched code for {user.email}")

        # Audit log entry
        AuditService.log(
            user=user,
            action_key='2fa_otp_dispatched',
            action_title='2FA Code Dispatched',
            details=f'Two-factor authentication code generated and sent to {cls.mask_email(user.email)}',
            category='security',
            ip_address=ip
        )

        return otp, code, temp_token

    @classmethod
    def verify_otp(cls, temp_token, code, request=None):
        """
        Validates the OTP code against temp_token.
        Returns (success: bool, result_or_message)
        """
        if not temp_token or not code:
            return False, "Missing verification token or OTP code."

        clean_code = str(code).strip()
        otp = EmailOTP.objects.filter(temp_token=temp_token).select_related('user').first()

        if not otp:
            return False, "Invalid or expired verification session. Please sign in again."

        if otp.is_used:
            return False, "This verification code has already been used. Please request a new code."

        if timezone.now() > otp.expires_at:
            return False, "Verification code has expired (valid for 5 minutes). Please request a new one."

        if otp.code != clean_code:
            ip = cls._get_ip(request) if request else None
            AuditService.log(
                user=otp.user,
                action_key='2fa_failed_attempt',
                action_title='2FA Verification Failed',
                details='Invalid 2FA code entered during login',
                category='security',
                ip_address=ip
            )
            return False, "Incorrect verification code. Please check your email and try again."

        # Mark OTP as consumed
        otp.is_used = True
        otp.save(update_fields=['is_used'])

        return True, otp.user

    @classmethod
    def resend_otp(cls, temp_token, request=None):
        """
        Resends a fresh OTP code for an active temp_token session.
        """
        if not temp_token:
            return False, "Missing verification session token."

        otp = EmailOTP.objects.filter(temp_token=temp_token).select_related('user').first()
        if not otp:
            return False, "Session not found or expired. Please sign in again."

        new_otp, code, new_temp_token = cls.generate_and_send_otp(otp.user, request=request)
        return True, {
            'temp_token': new_temp_token,
            'email_masked': cls.mask_email(otp.user.email),
            'message': 'A fresh 6-digit verification code has been dispatched to your email.'
        }

    @staticmethod
    def _get_ip(request):
        if not request:
            return None
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')
