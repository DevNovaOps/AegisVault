from django.contrib import admin
from .models import Vault, VaultItem, VaultShare


@admin.register(Vault)
class VaultAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'vault_type', 'status', 'created_at']
    list_filter = ['vault_type', 'status']
    search_fields = ['name', 'owner__name']


@admin.register(VaultItem)
class VaultItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'vault', 'category', 'created_at']
    list_filter = ['category']
    # Never display encrypted_data in admin
    exclude = ['encrypted_data', 'encryption_iv', 'encryption_tag']


@admin.register(VaultShare)
class VaultShareAdmin(admin.ModelAdmin):
    list_display = ['vault', 'trustee', 'access_level', 'status', 'created_at']
    list_filter = ['access_level', 'status']
