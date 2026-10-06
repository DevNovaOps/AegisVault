from django.contrib import admin
from .models import TrusteeProfile, Invitation


@admin.register(TrusteeProfile)
class TrusteeProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'owner', 'relationship', 'status', 'verification_status']
    list_filter = ['status', 'verification_status', 'relationship']
    search_fields = ['name', 'email']


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ['invitee_name', 'invitee_email', 'vault', 'status', 'sent_at', 'expires_at']
    list_filter = ['status']
    search_fields = ['invitee_name', 'invitee_email']
    # Never expose invitation token in admin
    exclude = ['token']
