"""
AegisVault — Accounts Views
Authentication endpoints: register, login, logout, me, profile, password, 2FA
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, ProfileUpdateSerializer
)
from .permissions import IsOwner
from audit.services import AuditService


class RegisterView(APIView):
    """POST /api/v1/auth/register"""
    permission_classes = [AllowAny]
    throttle_scope = 'login'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Create JWT tokens
        refresh = RefreshToken.for_user(user)

        # Audit log
        AuditService.log(
            user=user,
            action_key='user_registered',
            action_title='Account Created',
            details=f'New {user.role} account created for {user.email}',
            category='auth',
            ip_address=self._get_ip(request)
        )

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)

    def _get_ip(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')


class LoginView(APIView):
    """POST /api/v1/auth/login"""
    permission_classes = [AllowAny]
    throttle_scope = 'login'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        refresh = RefreshToken.for_user(user)

        AuditService.log(
            user=user,
            action_key='user_login',
            action_title='User Login',
            details=f'{user.role.title()} login from {self._get_ip(request)}',
            category='auth',
            ip_address=self._get_ip(request)
        )

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })

    def _get_ip(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')


class LogoutView(APIView):
    """POST /api/v1/auth/logout"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass

        AuditService.log(
            user=request.user,
            action_key='user_logout',
            action_title='User Logout',
            details=f'User signed out',
            category='auth',
        )

        return Response({'detail': 'Successfully signed out.'})


class CurrentUserView(APIView):
    """GET /api/v1/auth/me"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data,
        })


class ProfileUpdateView(APIView):
    """PUT /api/v1/owner/profile/update"""
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        AuditService.log(
            user=request.user,
            action_key='profile_updated',
            action_title='Profile Updated',
            details='User profile information updated',
            category='profile',
        )

        return Response({
            'user': UserSerializer(request.user).data,
            'detail': 'Profile updated successfully.'
        })


class ChangePasswordView(APIView):
    """POST /api/v1/owner/profile/change-password"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        AuditService.log(
            user=request.user,
            action_key='password_changed',
            action_title='Password Changed',
            details='Master encryption password changed',
            category='security',
        )

        return Response({'detail': 'Password changed successfully.'})


class Toggle2FAView(APIView):
    """POST /api/v1/owner/profile/2fa/toggle"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_2fa_enabled = not user.is_2fa_enabled
        user.save(update_fields=['is_2fa_enabled'])

        state = 'enabled' if user.is_2fa_enabled else 'disabled'

        AuditService.log(
            user=user,
            action_key='2fa_toggled',
            action_title=f'Two-Factor Authentication {state.title()}',
            details=f'2FA has been {state}',
            category='security',
        )

        return Response({
            'is_2fa_enabled': user.is_2fa_enabled,
            'detail': f'Two-factor authentication {state}.'
        })


class ExportDataView(APIView):
    """GET /api/v1/owner/profile/export-data"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = UserSerializer(user).data

        AuditService.log(
            user=user,
            action_key='data_exported',
            action_title='Data Export Requested',
            details='User requested account data export',
            category='profile',
        )

        return Response({
            'user': data,
            'detail': 'Data export generated.',
        })
