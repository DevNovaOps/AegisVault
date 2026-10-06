from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_email_verified']
    search_fields = ['email', 'name']
    ordering = ['-date_joined']
