"""
AegisVault — Notification Email Service
Handles dispatching rich transactional emails for in-app events:
- Dead Man's Switch warnings, grace periods, and activations
- Heartbeat check-in countdown reminders
- Release requests and trustee shard submission demands
- Security alerts and vault updates
"""
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger('aegisvault')


class NotificationEmailService:
    """Service to format and dispatch transactional notification emails."""

    @staticmethod
    def get_base_url():
        """Retrieve frontend base URL from Django settings."""
        return getattr(settings, 'AEGIS_FRONTEND_BASE_URL', 'http://127.0.0.1:8000').rstrip('/')

    @classmethod
    def send_notification_email(cls, notification):
        """
        Formats and dispatches an HTML transactional email for a Notification instance.
        Returns: (bool success, str message)
        """
        user = notification.user
        if not user or not user.email:
            logger.warning(f"Cannot send email for notification {notification.id}: user or email missing")
            return False, "User email missing"

        recipient_name = getattr(user, 'name', '') or user.email.split('@')[0]
        recipient_email = user.email
        n_type = (notification.notification_type or 'system').lower()
        title = notification.title or 'Security Alert'
        description = notification.description or ''
        vault_name = notification.vault_name or ''
        base_url = cls.get_base_url()

        # Determine visual theme & CTA based on notification type and title content
        theme = cls._determine_theme(n_type, title, description, base_url)

        subject = f"[AegisVault] {theme['subject_prefix']}{title}"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AegisVault <aegisvault10@gmail.com>')
        to_email = [recipient_email]

        # Plain text fallback
        text_body = f"""Hello {recipient_name},

{title}

{description}
{f"Vault: {vault_name}" if vault_name else ""}

Action Required:
{theme['action_url']}

Timestamp: {timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')}

--
AegisVault — What matters, lives on.
Digital Legacy & Cryptographic Custody Platform
This is an automated system notification. Please do not reply directly to this email.
"""

        # HTML Email Body
        html_body = cls._build_html_template(
            subject=subject,
            title=title,
            description=description,
            vault_name=vault_name,
            recipient_name=recipient_name,
            theme=theme,
        )

        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=to_email,
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)

            safe_title = title.encode('ascii', 'replace').decode('ascii')
            logger.info(f"Notification email dispatched successfully to {recipient_email} for '{safe_title}'")
            return True, "Email sent successfully"

        except Exception as e:
            logger.error(f"Failed to dispatch notification email to {recipient_email}: {str(e)}", exc_info=True)
            return False, str(e)

    @classmethod
    def _determine_theme(cls, n_type, title, description, base_url):
        """Determine color badges, action buttons, and icons based on notification nature."""
        title_lower = title.lower()
        desc_lower = description.lower()

        # 1. Dead Man's Switch Triggered / Release Active (Critical Red)
        if 'dead man' in title_lower or 'switch triggered' in title_lower or 'release initiated' in desc_lower:
            return {
                'badge': '🚨 CRITICAL • DEAD MAN\'S SWITCH TRIGGERED',
                'badge_color': '#ef4444',
                'badge_bg': 'rgba(239, 68, 68, 0.15)',
                'badge_border': '#dc2626',
                'accent_gradient': 'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
                'subject_prefix': '🚨 CRITICAL: ',
                'action_label': 'Review Dead Man\'s Switch Status',
                'action_url': f'{base_url}/Owner/release-management/release-management.html',
                'security_notice': 'The Dead Man\'s Switch has triggered automated vault release procedures. If you are safe, log in immediately to cancel or review the protocol.',
            }

        # 2. Heartbeat Missed / Grace Period Active (High Warning Amber/Red)
        if 'grace period' in title_lower or 'heartbeat missed' in title_lower or 'grace' in desc_lower:
            return {
                'badge': '⚠️ ACTION REQUIRED • GRACE PERIOD ACTIVE',
                'badge_color': '#f97316',
                'badge_bg': 'rgba(249, 115, 22, 0.15)',
                'badge_border': '#ea580c',
                'accent_gradient': 'linear-gradient(90deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                'subject_prefix': '⚠️ URGENT: ',
                'action_label': 'Confirm Check-In (I Am Alive)',
                'action_url': f'{base_url}/Owner/dashboard/dashboard.html',
                'security_notice': 'Your check-in deadline has passed. A grace period is currently running. Failure to check in before the grace period expires will trigger vault release to designated trustees.',
            }

        # 3. Heartbeat Reminder (Cyan / Blue advisory)
        if n_type == 'heartbeat' or 'reminder' in title_lower or 'check-in' in title_lower:
            return {
                'badge': '❤️ HEARTBEAT CHECK-IN REMINDER',
                'badge_color': '#38bdf8',
                'badge_bg': 'rgba(2, 132, 199, 0.15)',
                'badge_border': '#0284c7',
                'accent_gradient': 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #f97316 100%)',
                'subject_prefix': '❤️ Reminder: ',
                'action_label': 'Check In Now',
                'action_url': f'{base_url}/Owner/dashboard/dashboard.html',
                'security_notice': 'Regular check-ins keep your digital assets encrypted and prevent unwanted automated release triggers.',
            }

        # 4. Trustee Shard Submission (Purple)
        if 'share submission' in title_lower or 'shard' in title_lower:
            return {
                'badge': '🔐 TRUSTEE ACTION • SHARD SUBMISSION REQUIRED',
                'badge_color': '#a855f7',
                'badge_bg': 'rgba(168, 85, 247, 0.15)',
                'badge_border': '#9333ea',
                'accent_gradient': 'linear-gradient(90deg, #a855f7 0%, #7c3aed 50%, #2563eb 100%)',
                'subject_prefix': '🔐 Trustee Action: ',
                'action_label': 'Submit Your Trustee Key Shard',
                'action_url': f'{base_url}/Trustee/release-management/release-management.html',
                'security_notice': 'A release quorum has been initiated. Your cryptographic key shard is requested to satisfy the multi-party custody threshold.',
            }

        # 5. Security Alerts (Emerald / Red)
        if n_type == 'security':
            return {
                'badge': '🛡️ SECURITY ADVISORY',
                'badge_color': '#10b981',
                'badge_bg': 'rgba(16, 185, 129, 0.15)',
                'badge_border': '#059669',
                'accent_gradient': 'linear-gradient(90deg, #10b981 0%, #059669 50%, #0284c7 100%)',
                'subject_prefix': '🛡️ Security: ',
                'action_label': 'Review Account Security',
                'action_url': f'{base_url}/Owner/profile-security/profile-security.html',
                'security_notice': 'If you did not authorize this change or activity, immediately revoke active sessions and rotate your security clearance keys.',
            }

        # Default Generic Alert
        return {
            'badge': '🔔 AEGISVAULT NOTIFICATION',
            'badge_color': '#38bdf8',
            'badge_bg': 'rgba(2, 132, 199, 0.15)',
            'badge_border': '#0284c7',
            'accent_gradient': 'linear-gradient(90deg, #f97316 0%, #0284c7 100%)',
            'subject_prefix': '',
            'action_label': 'Open AegisVault Portal',
            'action_url': f'{base_url}/Owner/dashboard/dashboard.html',
            'security_notice': 'This automated notification was generated according to your account alerts and security settings.',
        }

    @classmethod
    def _build_html_template(cls, subject, title, description, vault_name, recipient_name, theme):
        """Construct a high-end, responsive dark HTML email."""
        vault_pill = f"""
        <div style="margin: 16px 0; padding: 10px 14px; background-color: #1e293b; border-left: 3px solid #38bdf8; border-radius: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">Associated Vault</span>
            <span style="font-size: 14px; font-weight: 600; color: #f8fafc;">🔒 {vault_name}</span>
        </div>
        """ if vault_name else ""

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
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: {theme['accent_gradient']};"></td>
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

          <!-- Hero Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <!-- Badge -->
              <div style="display: inline-block; padding: 5px 12px; background-color: {theme['badge_bg']}; border: 1px solid {theme['badge_border']}; border-radius: 9999px; font-size: 11px; font-weight: 700; color: {theme['badge_color']}; letter-spacing: 0.04em; margin-bottom: 18px;">
                {theme['badge']}
              </div>
              
              <h1 style="font-size: 21px; font-weight: 700; color: #ffffff; margin: 0 0 16px; line-height: 1.35;">
                {title}
              </h1>

              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin: 0 0 18px;">
                Hello <strong style="color: #ffffff;">{recipient_name}</strong>,
              </p>

              <div style="padding: 16px 20px; background-color: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 14.5px; color: #e2e8f0; line-height: 1.65; margin: 0;">
                  {description}
                </p>
              </div>

              {vault_pill}

              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 30px 0 24px;">
                <a href="{theme['action_url']}" style="display: inline-block; padding: 14px 32px; background: {theme['accent_gradient']}; color: #ffffff; text-decoration: none; font-size: 14.5px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); letter-spacing: 0.02em;">
                  {theme['action_label']} &rarr;
                </a>
              </div>

              <!-- Security Notice Callout -->
              <div style="padding: 14px 18px; background-color: rgba(30, 41, 59, 0.5); border: 1px solid #1e293b; border-radius: 8px; margin-top: 24px;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Security Information</div>
                <div style="font-size: 12.5px; color: #94a3b8; line-height: 1.5;">
                  {theme['security_notice']}
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
              <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 0 0 10px;">
                This critical automated message was transmitted from your <strong style="color: #94a3b8;">AegisVault Cryptographic Custody Node</strong>.<br>
                Direct access URL: <a href="{theme['action_url']}" style="color: #38bdf8; text-decoration: none;">{theme['action_url']}</a>
              </p>
              <p style="font-size: 11px; color: #475569; margin: 0;">
                &copy; {timezone.now().year} AegisVault Platform. Shamir's Secret Sharing &bull; Zero-Knowledge Proofs &bull; End-to-End Encryption.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
