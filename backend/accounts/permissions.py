"""
AegisVault — Role-based Permissions
Enforces OWNER, TRUSTEE, ADMIN access at the view level.
The backend determines the authenticated user's role — never trusts frontend claims.
"""
from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Allow only users with role=owner."""
    message = 'Access restricted to Vault Owners.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'owner'
        )


class IsTrustee(BasePermission):
    """Allow only users with role=trustee."""
    message = 'Access restricted to Designated Trustees.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'trustee'
        )


class IsAdminUser(BasePermission):
    """Allow only users with role=admin."""
    message = 'Access restricted to SecOps Administrators.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow owners and admins."""
    message = 'Access restricted to Vault Owners and Administrators.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('owner', 'admin')
        )


class IsVaultOwner(BasePermission):
    """
    Object-level permission: ensures the requesting user owns the vault.
    Used on views that operate on a specific vault instance.
    """
    message = 'You do not own this vault.'

    def has_object_permission(self, request, view, obj):
        # obj is a Vault instance
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'vault'):
            return obj.vault.owner == request.user
        return False


class IsResourceOwner(BasePermission):
    """
    Object-level permission: ensures the requesting user owns the resource
    (via owner FK or user FK).
    """
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
