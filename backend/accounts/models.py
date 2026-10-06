"""
AegisVault — Accounts App: Custom User Model
Roles: OWNER, TRUSTEE, ADMIN
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager for AegisVault User model."""

    def create_user(self, email, name, password=None, role='owner', **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, name, password, role='admin', **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for AegisVault.
    The frontend stores { name, email, role } in localStorage as 'aegis_user'.
    """

    class Role(models.TextChoices):
        OWNER = 'owner', 'Vault Owner'
        TRUSTEE = 'trustee', 'Designated Trustee'
        ADMIN = 'admin', 'SecOps Administrator'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.OWNER)
    phone = models.CharField(max_length=30, blank=True, default='')

    # Profile fields
    avatar = models.URLField(blank=True, default='')
    bio = models.TextField(blank=True, default='')
    timezone_preference = models.CharField(max_length=50, default='UTC')

    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_2fa_enabled = models.BooleanField(default=False)

    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'aegis_users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.email}) [{self.role}]"

    @property
    def is_owner(self):
        return self.role == self.Role.OWNER

    @property
    def is_trustee(self):
        return self.role == self.Role.TRUSTEE

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN
