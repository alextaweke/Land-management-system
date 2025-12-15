from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, role="owner"):
        if not username:
            raise ValueError("Username is required")

        user = self.model(
            username=username,
            role=role
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password):
        user = self.create_user(
            username=username,
            password=password,
            role="admin"
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("owner", "Land Owner"),
        ("officer", "Officer"),
        ("admin", "Admin"),
    ]

    username = models.CharField(max_length=150, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="owner")

    # Required Django permission fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []  # No fields required besides username

    objects = UserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"
