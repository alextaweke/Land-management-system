from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "admin")


class IsOfficer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "officer")


class IsCitizen(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "citizen")


class IsAdminOrOfficer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role in ["admin", "officer"])
