import os
from pathlib import Path
from django.conf import settings
from django.http import Http404
from django.shortcuts import redirect
from django.views.static import serve


def home_view(request):
    """Redirect root / to the main AegisVault landing page."""
    return redirect('/AegisVault%20Home/index.html')


def auth_view(request):
    """Redirect /auth/ and /login/ to the role-based auth gateway."""
    return redirect('/auth.html')


def owner_portal_view(request):
    """Redirect /owner/ to the Owner dashboard."""
    return redirect('/Owner/dashboard/dashboard.html')


def trustee_portal_view(request):
    """Redirect /trustee/ to the Trustee dashboard."""
    return redirect('/Trustee/dashboard/dashboard.html')


def admin_portal_view(request):
    """Redirect /admin-portal/ to the AegisVault SecOps Admin Portal."""
    return redirect('/Admin/Dashboard/admin.html')


def frontend_serve(request, path=''):
    """
    Serve static assets, HTML pages, scripts, and stylesheets from the
    workspace root (settings.FRONTEND_DIR).
    Automatically resolves index.html if a directory is requested.
    """
    frontend_dir = Path(settings.FRONTEND_DIR).resolve()
    target = (frontend_dir / path).resolve()

    # Prevent path traversal outside FRONTEND_DIR
    try:
        target.relative_to(frontend_dir)
    except ValueError:
        raise Http404("Invalid path")

    if target.is_dir():
        index_file = target / 'index.html'
        if index_file.exists():
            rel = index_file.relative_to(frontend_dir).as_posix()
            return serve(request, rel, document_root=str(frontend_dir))

    return serve(request, path, document_root=str(frontend_dir))
