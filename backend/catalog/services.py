"""Catalog rules: slug creation and primary-image handling.

Serializers, Django admin and the shell call these functions, so the rules
live in one place instead of inside the models.
"""

from django.db import transaction
from django.utils.text import slugify

from catalog.models import SLUG_MAX_LENGTH, ProductImage


def generate_unique_slug(model, name):
    """Return a slug for `name` that no row of `model` uses yet.

    If the plain slug is taken, -2, -3 and so on is added. Room is left in
    the field for that suffix, so a very long name can't overflow it.
    """
    base = slugify(name)[: SLUG_MAX_LENGTH - 10].strip("-") or "item"
    slug, counter = base, 2
    while model.objects.filter(slug=slug).exists():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


def assign_slug(instance):
    """Give a Category, HairStyle or Product its slug if it doesn't have one yet.

    Call this before the first `save()`. An existing slug is never changed,
    so renaming something doesn't break links people have already shared.
    """
    if not instance.slug:
        instance.slug = generate_unique_slug(type(instance), instance.name)


def add_product_image(product, is_primary=False, **fields):
    """Create an image for `product` and return it.

    The image becomes primary if you ask for it, or if it is the product's
    first image. Any earlier primary image is demoted in the same transaction.
    """
    with transaction.atomic():
        images = ProductImage.objects.filter(product=product)
        make_primary = is_primary or not images.exists()
        if make_primary:
            images.filter(is_primary=True).update(is_primary=False)
        return ProductImage.objects.create(product=product, is_primary=make_primary, **fields)


def set_primary_image(image):
    """Make `image` its product's primary image and demote the current one."""
    with transaction.atomic():
        ProductImage.objects.filter(
            product_id=image.product_id, is_primary=True
        ).exclude(pk=image.pk).update(is_primary=False)
        image.is_primary = True
        image.save(update_fields=["is_primary"])


def delete_product_image(image):
    """Delete `image`. If it was the primary, the next image by sort order takes over."""
    with transaction.atomic():
        product_id, was_primary = image.product_id, image.is_primary
        image.delete()
        if was_primary:
            successor = (
                ProductImage.objects.filter(product_id=product_id)
                .order_by("sort_order", "id")
                .first()
            )
            if successor:
                set_primary_image(successor)