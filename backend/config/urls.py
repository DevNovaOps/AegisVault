"""
AegisVault Backend — URL Configuration
All API routes are versioned under /api/v1/
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # ─── API v1 ──────────────────────────────────────────────────────────
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/owner/', include('vaults.urls')),
    path('api/v1/owner/', include('trustees.urls')),
    path('api/v1/owner/', include('releases.urls')),
    path('api/v1/owner/', include('notifications.urls')),
    path('api/v1/owner/', include('dashboard.urls')),
    path('api/v1/owner/', include('heartbeat.urls')),
    path('api/v1/owner/', include('support.urls')),
    path('api/v1/owner/', include('audit.urls_owner')),

    # Admin panel APIs
    path('api/v1/admin/', include('dashboard.urls_admin')),
    path('api/v1/admin/', include('audit.urls_admin')),

    # Trustee panel APIs
    path('api/v1/trustee/', include('trustees.urls_trustee')),
]
