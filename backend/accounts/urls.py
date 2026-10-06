"""
AegisVault — Accounts URL Configuration
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, LogoutView, CurrentUserView,
    ProfileUpdateView, ChangePasswordView, Toggle2FAView, ExportDataView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile & Security (also accessible via /api/v1/owner/profile/...)
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/2fa/toggle/', Toggle2FAView.as_view(), name='toggle-2fa'),
    path('profile/export-data/', ExportDataView.as_view(), name='export-data'),
]
