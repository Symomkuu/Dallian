"""Permission classes for the users app."""

from rest_framework.permissions import BasePermission


class IsStaffRole(BasePermission):
    """Allow only logged-in, active users whose role is staff.

    This is the dashboard gate. It checks `role`, not Django's `is_staff`
    flag, so shop staff can use the dashboard without being able to enter
    Django admin, and a Django admin user with the customer role can't use
    the dashboard.
    """

    message = "You do not have permission to use the dashboard."

    def has_permission(self, request, view):
        """Return True if the caller is an active staff member."""
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_shop_staff)