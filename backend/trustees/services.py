"""
AegisVault — Trustee Email & Notification Service
Handles sending transactional emails for trustee invitations, reminders, and status changes.
Supports live Gmail SMTP delivery as well as simulated development logging.
"""
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger('aegisvault')


class TrusteeEmailService:
    """Service for sending emails to trustees."""

    @staticmethod
    def get_base_url(request=None):
        if request:
            try:
                return request.build_absolute_uri('/')[:-1]
            except Exception:
                pass
        return getattr(settings, 'AEGIS_FRONTEND_BASE_URL', 'http://127.0.0.1:8000')

    @classmethod
    def send_trustee_invitation_email(cls, invitation, request=None):
        """
        Dispatches an invitation email to the designated trustee.
        Returns: (bool success, str message)
        """
        invitee_name = invitation.invitee_name or 'Trustee'
        invitee_email = invitation.invitee_email
        owner_name = invitation.owner.name or invitation.owner.email
        owner_email = invitation.owner.email
        vault_name = invitation.vault.name if invitation.vault else 'Designated Vault'
        relationship = invitation.relationship or 'Trusted Guardian'
        note = invitation.note or ''
        token = invitation.token
        expiry_days = invitation.expiry_days or 14

        base_url = cls.get_base_url(request)
        accept_url = f"{base_url}/auth.html?role=trustee&mode=signup&token={token}&email={invitee_email}"
        portal_url = f"{base_url}/Trustee/invitations/invitations.html"

        subject = f"[AegisVault] {owner_name} invited you to become a Trustee for '{vault_name}'"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AegisVault <aegisvault10@gmail.com>')
        to_email = [invitee_email]

        # Plain text fallback
        text_body = f"""Hello {invitee_name},

{owner_name} ({owner_email}) has designated you as a trusted guardian (Trustee) for their digital vault: "{vault_name}" on AegisVault.

Relationship: {relationship}
{f'Personal Message: "{note}"' if note else ''}

As a designated trustee, you participate in cryptographic multi-party custody (Shamir's Secret Sharing). Your role safeguards their digital legacy and assets according to their consensus release conditions. No daily action is required from you.

To accept this invitation and set up your trustee access, click the secure link below:
{accept_url}

Your Unique Invitation Token:
{token}

(If you already have an AegisVault trustee account, you can also sign in directly at {portal_url})

This invitation is valid for {expiry_days} days.

--
AegisVault — What matters, lives on.
Digital Legacy & Cryptographic Custody Platform
"""

        # Premium HTML Email Template
        note_html_block = f"""
        <div style="margin: 20px 0; padding: 16px 20px; background-color: rgba(249, 115, 22, 0.08); border-left: 3px solid #f97316; border-radius: 6px;">
            <div style="font-size: 11px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Personal Note from {owner_name}</div>
            <div style="font-size: 14px; color: #e2e8f0; font-style: italic; line-height: 1.5;">&ldquo;{note}&rdquo;</div>
        </div>
        """ if note else ""

        html_body = f"""
<!DOCTYPE html>
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
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f97316 0%, #ea580c 50%, #0284c7 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
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
              <div style="font-size: 12px; color: #94a3b8; margin-top: 6px; letter-spacing: 0.04em;">DIGITAL LEGACY &amp; CRYPTOGRAPHIC CUSTODY</div>
            </td>
          </tr>

          <!-- Hero Body -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              <div style="display: inline-block; padding: 4px 10px; background-color: rgba(2, 132, 199, 0.15); border: 1px solid rgba(2, 132, 199, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
                Trustee Designation
              </div>
              
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 16px; line-height: 1.35;">
                You've been invited as a Digital Guardian
              </h1>

              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin: 0 0 20px;">
                Hello <strong style="color: #ffffff;">{invitee_name}</strong>,
              </p>

              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin: 0 0 20px;">
                <strong style="color: #ffffff;">{owner_name}</strong> (<a href="mailto:{owner_email}" style="color: #38bdf8; text-decoration: none;">{owner_email}</a>) has designated you as a trusted Trustee for their vault:
              </p>

              <!-- Vault Highlight Box -->
              <table role="presentation" width="100%" style="background-color: #0b1320; border: 1px solid #1e293b; border-radius: 10px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Assigned Vault</div>
                    <div style="font-size: 18px; font-weight: 700; color: #f97316; margin-top: 4px;">{vault_name}</div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Relationship: <strong style="color: #e2e8f0;">{relationship}</strong></div>
                  </td>
                </tr>
              </table>

              {note_html_block}

              <!-- Security Information -->
              <table role="presentation" width="100%" style="background-color: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 10px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 10px;">What Does Being a Trustee Mean?</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: top; width: 24px; padding-bottom: 8px;">🔐</td>
                        <td style="font-size: 13px; color: #94a3b8; line-height: 1.45; padding-bottom: 8px;">
                          <strong style="color: #e2e8f0;">Zero Decryption Alone:</strong> You receive a cryptographic shard via Shamir's Secret Sharing. Your shard cannot decrypt anything by itself.
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; width: 24px; padding-bottom: 8px;">🛡️</td>
                        <td style="font-size: 13px; color: #94a3b8; line-height: 1.45; padding-bottom: 8px;">
                          <strong style="color: #e2e8f0;">Consensus Only:</strong> Access is only unlocked if a multi-party consensus of guardians verifies identity upon an authorized release event.
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; width: 24px;">⏱️</td>
                        <td style="font-size: 13px; color: #94a3b8; line-height: 1.45;">
                          <strong style="color: #e2e8f0;">No Daily Maintenance:</strong> No regular logins or tasks required. You will only be alerted if a release verification is initiated.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Main CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="{accept_url}" target="_blank" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4); letter-spacing: 0.01em;">
                      Accept Trustee Invitation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Invitation Code Display -->
              <div style="text-align: center; margin-bottom: 24px; font-size: 12px; color: #94a3b8;">
                Direct Invitation Code: <code style="background-color: #0b1320; border: 1px solid #1e293b; padding: 4px 8px; border-radius: 4px; color: #38bdf8; font-family: monospace; font-size: 12px;">{token}</code>
              </div>

              <div style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; padding-top: 12px; border-top: 1px solid #1e293b;">
                This invitation is valid for <strong>{expiry_days} days</strong>. If you already have an account, you can also view it in your <a href="{portal_url}" style="color: #f97316; text-decoration: none;">Trustee Console</a>.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #070d18; padding: 24px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px;">
                &copy; {timezone.now().year} AegisVault. What matters, lives on.
              </p>
              <p style="font-size: 11px; color: #475569; margin: 0;">
                If you do not recognize {owner_name}, you can safely disregard this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

        # Dispatch via SMTP or Log Simulation
        return cls._send_email(
            subject=subject,
            text_body=text_body,
            html_body=html_body,
            from_email=from_email,
            to_email=to_email,
            invite_url=accept_url,
            token=token,
            action_name="Trustee Invitation"
        )

    @classmethod
    def send_trustee_reminder_email(cls, invitation, request=None):
        """Dispatches a reminder verification ping to the trustee."""
        invitee_name = invitation.invitee_name or 'Trustee'
        invitee_email = invitation.invitee_email
        owner_name = invitation.owner.name or invitation.owner.email
        vault_name = invitation.vault.name if invitation.vault else 'Designated Vault'
        token = invitation.token

        base_url = cls.get_base_url(request)
        accept_url = f"{base_url}/auth.html?role=trustee&mode=signup&token={token}&email={invitee_email}"

        subject = f"[Reminder] {owner_name} requested your trustee verification for '{vault_name}'"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AegisVault <aegisvault10@gmail.com>')
        to_email = [invitee_email]

        text_body = f"""Hello {invitee_name},

This is a reminder that {owner_name} is awaiting your trustee verification for their vault: "{vault_name}" on AegisVault.

Please click the secure link below to accept the invitation and confirm your trustee role:
{accept_url}

Token: {token}

--
AegisVault — Digital Legacy Custody
"""

        html_body = f"""
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 30px; background-color: #050b14; font-family: sans-serif; color: #f8fafc;">
  <div style="max-width: 540px; margin: 0 auto; background: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
    <h2 style="color: #f97316; margin-top: 0;">Verification Reminder</h2>
    <p>Hello <strong>{invitee_name}</strong>,</p>
    <p><strong>{owner_name}</strong> has sent a reminder regarding your trustee designation for vault: <strong style="color: #f97316;">{vault_name}</strong>.</p>
    <p style="margin: 24px 0;">
      <a href="{accept_url}" style="background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block;">
        Accept Invitation &rarr;
      </a>
    </p>
    <p style="font-size: 12px; color: #94a3b8;">Invitation Token: <code>{token}</code></p>
    <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;">
    <p style="font-size: 11px; color: #64748b; margin: 0;">AegisVault — What matters, lives on.</p>
  </div>
</body>
</html>
"""

        return cls._send_email(
            subject=subject,
            text_body=text_body,
            html_body=html_body,
            from_email=from_email,
            to_email=to_email,
            invite_url=accept_url,
            token=token,
            action_name="Verification Reminder"
        )

    @classmethod
    def _send_email(cls, subject, text_body, html_body, from_email, to_email, invite_url, token, action_name):
        """Internal helper to dispatch email with graceful fallback."""
        host_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '').strip()
        host_user = getattr(settings, 'EMAIL_HOST_USER', '').strip()

        # Fallback to reading backend/.env directly in case runserver process has not reloaded
        if not host_password:
            try:
                from decouple import config
                host_password = config('EMAIL_HOST_PASSWORD', default='').strip()
                if host_password:
                    settings.EMAIL_HOST_PASSWORD = host_password
            except Exception:
                pass

        if not host_user:
            try:
                from decouple import config
                host_user = config('EMAIL_HOST_USER', default='').strip()
                if host_user:
                    settings.EMAIL_HOST_USER = host_user
            except Exception:
                pass

        # If password is not configured yet, simulate safely without raising SMTPAuthenticationError
        if not host_password:
            logger.warning(
                f"[AegisVault Email] EMAIL_HOST_PASSWORD is empty in backend/.env. "
                f"{action_name} for {to_email} was simulated. "
                f"Please add your 16-character Google App Password in backend/.env to send live emails."
            )
            print(f"\n=======================================================")
            print(f"[EMAIL] [AegisVault {action_name} Simulated]")
            print(f"To: {to_email}")
            print(f"From: {from_email} (User: {host_user})")
            print(f"Subject: {subject}")
            print(f"Accept Link: {invite_url}")
            print(f"Token: {token}")
            print(f"Notice: Set EMAIL_HOST_PASSWORD in backend/.env for live inbox delivery.")
            print(f"=======================================================\n")
            return False, "Simulated (Add EMAIL_HOST_PASSWORD in backend/.env for live Gmail delivery)"

        # Password is set -> Ensure Django SMTP connection uses it
        settings.EMAIL_HOST_PASSWORD = host_password
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=to_email
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)
            logger.info(f"Successfully delivered {action_name} email to {to_email}")
            print(f"[OK] [AegisVault Live Email Sent] Successfully sent {action_name} to {to_email}")
            return True, "Email delivered successfully"
        except Exception as e:
            logger.error(f"Failed to dispatch {action_name} email to {to_email}: {e}")
            print(f"[FAIL] [AegisVault Live Email Failed] To: {to_email}, Error: {e}")
            return False, str(e)
