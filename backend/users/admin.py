"""Admin registrations for the users app."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from users.models import OTP, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin for the custom `User` model."""

    ordering = ("-created_at",)
    list_display = (
        "email",
        "full_name",
        "role",
        "is_email_verified",
        "is_active",
        "is_staff",
        "created_at",
    )
    list_filter = ("role", "is_email_verified", "is_active", "is_staff")
    # The base class searches "username", which our model doesn't have
    search_fields = ("email", "full_name", "phone")
    readonly_fields = ("created_at", "last_login")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal info",
            {"fields": ("full_name", "phone", "delivery_address")},
        ),
        (
            "Shop access",
            {
                "fields": ("role", "is_email_verified"),
                "description": (
                    "Role 'staff' gives access to the shop dashboard. "
                    "It does not give access to this Django admin."
                ),
            },
        ),
        (
            "Notifications",
            {"fields": ("notify_order_updates", "notify_promotions_and_deals")},
        ),
        (
            "Django admin access",
            {
                "fields": ("is_active", "is_staff", "is_superuser"),
                "description": (
                    "'Staff status' lets this person log into this Django admin. "
                    "Only give it to yourself."
                ),
            },
        ),
        (
            "Advanced permissions",
            {
                "classes": ("collapse",),
                "fields": ("groups", "user_permissions"),
            },
        ),
        ("Important dates", {"fields": ("last_login", "created_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "phone",
                    "role",
                    "is_email_verified",
                    "password1",
                    "password2",
                ),
            },
        ),
    )


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    """Read-only view of one-time codes, useful for debugging."""

    ordering = ("-created_at",)
    list_display = ("user", "code", "purpose", "is_used", "attempts", "expires_at", "created_at")
    list_filter = ("purpose", "is_used")
    search_fields = ("user__email", "code")
    readonly_fields = ("user", "code", "purpose", "expires_at", "is_used", "attempts", "created_at")

    def has_add_permission(self, request):
        return False