from django.contrib import admin
from .models import Vault, VaultAsset, VaultShare


@admin.register(Vault)
class VaultAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'vault_type', 'status', 'created_at']
    list_filter = ['vault_type', 'status']
    search_fields = ['name', 'owner__name']


@admin.register(VaultAsset)
class VaultAssetAdmin(admin.ModelAdmin):
    list_display = ['name', 'vault', 'category', 'sensitivity', 'created_at']
    list_filter = ['category', 'sensitivity']
    # Never display encrypted_data in admin
    exclude = ['encrypted_data', 'encryption_iv', 'encryption_tag', 'file']


@admin.register(VaultShare)
class VaultShareAdmin(admin.ModelAdmin):
    list_display = ['vault', 'trustee', 'access_level', 'status', 'created_at']
    list_filter = ['access_level', 'status']
