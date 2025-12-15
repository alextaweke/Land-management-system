from rest_framework.permissions import BasePermission

class IsAdminOrSelf(BasePermission):
    """
    Admins can access everything.
    Owners can access only their own profile.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:     # admin
            return True
        return obj.user == request.user  # owner → only their own profile
