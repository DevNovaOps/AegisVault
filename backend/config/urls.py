"""
AegisVault Backend — URL Configuration
All API routes are versioned under /api/v1/
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def api_root(request):
    return JsonResponse({
        "status": "online",
        "service": "AegisVault Backend API",
        "version": "v1",
        "admin_url": "/admin/",
        "api_endpoints": {
            "auth": "/api/v1/auth/",
            "owner": "/api/v1/owner/",
            "admin": "/api/v1/admin/",
            "trustee": "/api/v1/trustee/",
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
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
    path('api/v1/admin/dashboard/', include('dashboard.urls_admin')),
    path('api/v1/admin/security/', include('audit.urls_admin')),
    path('api/v1/admin/', include('dashboard.urls_admin_management')),
    path('api/v1/admin/security/', include('security.urls')),
    path('api/v1/admin/analytics/', include('analytics.urls')),
    path('api/v1/admin/reports/', include('reports.urls')),
    path('api/v1/admin/system-health/', include('system_health.urls')),

    # Trustee panel APIs
    path('api/v1/trustee/', include('trustees.urls_trustee')),
]
