"""
AegisVault Backend — URL Configuration
All API routes are versioned under /api/v1/
Frontend routes and static assets served from workspace root.
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from web.views import frontend_serve

urlpatterns = [
    # Django framework admin (developer database console)
    path('admin/', admin.site.urls),

    # ─── API v1 ──────────────────────────────────────────────────────────
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/owner/', include('vaults.urls')),
    path('api/v1/owner/', include('trustees.urls')),
    path('api/v1/owner/', include('releases.urls')),
    path('api/v1/owner/', include('notifications.urls')),
    path('api/v1/owner/dashboard/', include('dashboard.urls')),
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

    # Web routes (Landing, Auth, Portals)
    path('', include('web.urls')),

    # Serve all static files, HTML pages, CSS, JS, and assets from workspace root
    re_path(r'^(?P<path>.*)$', frontend_serve),
]
