"""
AegisVault — Accounts: 2FA Email OTP Service
Handles cryptographic generation, email dispatching, expiration, and validation.
"""
import secrets
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
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
        recipient_name = getattr(user, 'name', '') or user.email.split('@')[0]
        masked_email = cls.mask_email(user.email)

        # Email Subject & Plaintext Fallback
        subject = f"[AegisVault] 🔐 Your 2FA Verification Code: {code}"
        text_body = (
            f"Hello {recipient_name},\n\n"
            f"Your AegisVault two-factor authentication (2FA) verification code is:\n\n"
            f"=========================================\n"
            f"             {code}\n"
            f"=========================================\n\n"
            f"This code will expire in {cls.OTP_EXPIRY_MINUTES} minutes.\n"
            f"Enter this code on the authentication screen to complete your sign in.\n\n"
            f"Account: {masked_email}\n"
            f"Request IP: {ip or 'Authorized Client'}\n"
            f"Timestamp: {timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
            f"SECURITY NOTICE: If you did not request this login code, someone may have compromised your password. "
            f"Please update your master security credentials immediately.\n\n"
            f"--\n"
            f"AegisVault — What matters, lives on.\n"
            f"Zero-Knowledge Cryptographic Custody Platform\n"
        )

        # Rich HTML Email Body matching AegisVault design system
        html_body = cls._build_html_email(
            subject=subject,
            recipient_name=recipient_name,
            code=code,
            masked_email=masked_email,
            ip=ip or 'Authorized Client',
            expires_at=expires_at,
        )

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AegisVault Security <aegisvault10@gmail.com>')

        # Send Email via EmailMultiAlternatives
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=[user.email],
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)
            logger.info(f"[2FA OTP] HTML email dispatched successfully to {user.email}")
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
    def _build_html_email(cls, subject, recipient_name, code, masked_email, ip, expires_at):
        """Constructs a responsive, dark, premium HTML email for 2FA verification."""
        formatted_digits = " ".join(list(code))
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050b14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050b14; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Accent Bar: Signature Orange Gradient -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f97316 0%, #ea580c 50%, #c2410c 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <div style="width: 36px; height: 36px; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 8px; display: inline-block; text-align: center; line-height: 36px;">
                      <span style="font-size: 18px; color: #f97316;">🛡️</span>
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">Aegis<span style="color: #f97316;">Vault</span></span>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; letter-spacing: 0.05em; text-transform: uppercase;">Digital Legacy &amp; Cryptographic Custody</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <!-- Security Badge -->
              <div style="display: inline-block; padding: 5px 12px; background-color: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #f97316; letter-spacing: 0.04em; margin-bottom: 18px;">
                🔐 TWO-FACTOR AUTHENTICATION • VERIFICATION CODE
              </div>
              
              <h1 style="font-size: 21px; font-weight: 700; color: #ffffff; margin: 0 0 16px; line-height: 1.35;">
                Verify Your Identity
              </h1>

              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin: 0 0 18px;">
                Hello <strong style="color: #ffffff;">{recipient_name}</strong>,
              </p>

              <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 20px;">
                A sign-in attempt was initiated for your AegisVault account. To complete authentication, please enter this one-time 6-digit verification code:
              </p>

              <!-- Highlighted OTP Vault Card -->
              <div style="background-color: #0b1329; border: 1px solid #1e293b; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 24px 0; box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">
                  Your Verification Code
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #f97316; padding-left: 10px; text-shadow: 0 0 20px rgba(249, 115, 22, 0.35);">
                  {formatted_digits}
                </div>
                <div style="margin-top: 14px;">
                  <span style="display: inline-block; padding: 4px 12px; background-color: rgba(249, 115, 22, 0.12); border-radius: 9999px; font-size: 12px; font-weight: 600; color: #fb923c;">
                    ⏱️ Code expires in {cls.OTP_EXPIRY_MINUTES} minutes
                  </span>
                </div>
              </div>

              <!-- Context Details Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 8px;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #1e293b; width: 35%;">Target Account</td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #cbd5e1; font-weight: 600; border-bottom: 1px solid #1e293b;">{masked_email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #1e293b;">Client IP</td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #cbd5e1; font-family: monospace; border-bottom: 1px solid #1e293b;">{ip}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; color: #64748b;">Expires At</td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #cbd5e1;">{expires_at.strftime('%H:%M:%S UTC')}</td>
                </tr>
              </table>

              <!-- Security Warning Notice -->
              <div style="background-color: rgba(15, 23, 42, 0.8); border-left: 3px solid #f97316; padding: 12px 14px; border-radius: 4px; margin: 22px 0 10px;">
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                  <strong style="color: #cbd5e1;">Security Notice:</strong> AegisVault will never contact you to ask for this verification code. If you did not attempt to sign in, someone may know your password. Log in to AegisVault and change your master password immediately.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #070d18; border-top: 1px solid #1e293b; text-align: center;">
              <p style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin: 0 0 4px;">
                AegisVault &mdash; What matters, lives on.
              </p>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 12px;">
                Zero-Knowledge Digital Legacy &amp; Cryptographic Custody
              </p>
              <p style="font-size: 10px; color: #475569; margin: 0; line-height: 1.4;">
                This automated security alert was dispatched by the AegisVault Identity Clearance Engine.<br>
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

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
