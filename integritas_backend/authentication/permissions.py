from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """
    Allows access for Django staff/superusers and users marked as admin in the
    app's custom role fields.
    """

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or user.is_staff:
            return True

        role = str(getattr(user, "role", "") or "").lower()
        if role in ("admin", "super_admin"):
            return True

        roles = getattr(user, "roles_list", None) or []
        return any(str(item).lower() in ("admin", "super_admin") for item in roles)
