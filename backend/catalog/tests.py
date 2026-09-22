"""Database-backed tests for the catalog app.

Run with:  python manage.py test catalog
"""

from django.db import IntegrityError, transaction
from django.db.models import ProtectedError
from django.test import TestCase

from catalog.models import Brand, Category, Product, ProductImage
from catalog.services import (
    add_product_image,
    assign_slug,
    delete_product_image,
    generate_unique_slug,
    set_primary_image,
)


def make_category(name="Lace Front", **extra):
    """Create and save a Category with a generated slug."""
    category = Category(name=name, **extra)
    assign_slug(category)
    category.save()
    return category


def make_brand(name="Outre", **extra):
    """Create and save a Brand with a generated slug."""
    brand = Brand(name=name, **extra)
    assign_slug(brand)
    brand.save()
    return brand


def make_product(name="Body Wave Wig", price=15000, **extra):
    """Create and save a Product, with a Category created if none is given."""
    category = extra.pop("category", None) or make_category()
    product = Product(name=name, price=price, category=category, **extra)
    assign_slug(product)
    product.save()
    return product


# ----------------------------------------------------------------- slugs


class SlugGenerationTests(TestCase):
    """generate_unique_slug and assign_slug."""

    def test_slug_is_generated_from_the_name(self):
        """A plain name becomes a plain slug."""
        self.assertEqual(generate_unique_slug(Category, "Lace Front"), "lace-front")

    def test_collision_appends_a_counter(self):
        """A taken slug gets -2, -3 and so on."""
        make_category(name="Lace Front")
        self.assertEqual(generate_unique_slug(Category, "Lace Front"), "lace-front-2")
        make_category(name="Lace Front Two", slug="lace-front-2")
        self.assertEqual(generate_unique_slug(Category, "Lace Front"), "lace-front-3")

    def test_long_name_is_truncated_with_room_for_a_suffix(self):
        """A very long name still fits in the slug field, even with a counter appended."""
        long_name = "Wig " * 100
        slug = generate_unique_slug(Category, long_name)
        self.assertLessEqual(len(slug), 255)
        make_category(name=long_name, slug=slug)
        second_slug = generate_unique_slug(Category, long_name)
        self.assertNotEqual(slug, second_slug)
        self.assertLessEqual(len(second_slug), 255)

    def test_assign_slug_does_not_overwrite_an_existing_slug(self):
        """Renaming a saved object doesn't change its slug."""
        category = make_category(name="Lace Front")
        original_slug = category.slug
        category.name = "Renamed"
        assign_slug(category)
        self.assertEqual(category.slug, original_slug)


# -------------------------------------------------------------- category


class CategoryModelTests(TestCase):
    """Category rules: unique name, protection from deletion while in use."""

    def test_name_is_unique_ignoring_case(self):
        """'Lace Front' and 'LACE FRONT' can't both exist."""
        make_category(name="Lace Front")
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_category(name="LACE FRONT")

    def test_category_in_use_cannot_be_deleted(self):
        """A category with a product can only be deactivated, not deleted."""
        category = make_category()
        make_product(category=category)
        with self.assertRaises(ProtectedError):
            category.delete()

    def test_unused_category_can_be_deleted(self):
        """A category with no products deletes normally."""
        category = make_category()
        category.delete()
        self.assertFalse(Category.objects.filter(pk=category.pk).exists())


# ------------------------------------------------------------------ brand


class BrandModelTests(TestCase):
    """Brand rules: unique name, protection from deletion while in use, optional on products."""

    def test_name_is_unique_ignoring_case(self):
        """'Outre' and 'outre' can't both exist."""
        make_brand(name="Outre")
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_brand(name="outre")

    def test_brand_in_use_cannot_be_deleted(self):
        """A brand with a product can only be deactivated, not deleted."""
        brand = make_brand()
        make_product(brand=brand)
        with self.assertRaises(ProtectedError):
            brand.delete()

    def test_product_can_be_created_without_a_brand(self):
        """Brand is optional on a product."""
        product = make_product()
        self.assertIsNone(product.brand)


# ---------------------------------------------------------------- product


class ProductModelTests(TestCase):
    """Product rules: price, previous price, and SKU uniqueness."""

    def test_price_must_be_above_zero(self):
        """A zero or negative price is rejected by the database."""
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_product(price=0)

    def test_previous_price_must_be_higher_than_the_price(self):
        """previous_price equal to or below price is rejected."""
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_product(price=1000, previous_price=1000)

    def test_previous_price_above_the_price_is_allowed(self):
        """A previous_price higher than price is accepted."""
        product = make_product(price=1000, previous_price=1500)
        self.assertEqual(product.previous_price, 1500)

    def test_previous_price_can_be_left_blank(self):
        """A product with no discount has no previous_price."""
        product = make_product()
        self.assertIsNone(product.previous_price)

    def test_blank_skus_can_repeat(self):
        """Multiple products can each have no SKU."""
        category = make_category()
        make_product(name="A", category=category)
        make_product(name="B", category=category)  # both have sku=""

    def test_real_skus_must_be_unique(self):
        """Two products can't share a real SKU."""
        category = make_category()
        make_product(name="A", sku="WIG-001", category=category)
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_product(name="B", sku="WIG-001", category=category)


# --------------------------------------------------------- product images


class ProductImageServiceTests(TestCase):
    """add_product_image, set_primary_image and delete_product_image."""

    def setUp(self):
        """Create a product to attach images to."""
        self.product = make_product()

    def test_first_image_becomes_primary_automatically(self):
        """The first image added to a product is made primary."""
        image = add_product_image(self.product, image_url="https://res.cloudinary.com/x/a.jpg")
        self.assertTrue(image.is_primary)

    def test_second_image_is_not_primary_by_default(self):
        """A later image doesn't take over as primary unless asked."""
        add_product_image(self.product, image_url="https://res.cloudinary.com/x/a.jpg")
        second = add_product_image(self.product, image_url="https://res.cloudinary.com/x/b.jpg")
        self.assertFalse(second.is_primary)

    def test_adding_a_primary_image_demotes_the_old_one(self):
        """Explicitly adding a primary image demotes the current one."""
        first = add_product_image(self.product, image_url="https://res.cloudinary.com/x/a.jpg")
        add_product_image(
            self.product, image_url="https://res.cloudinary.com/x/b.jpg", is_primary=True
        )
        first.refresh_from_db()
        self.assertFalse(first.is_primary)

    def test_set_primary_image_swaps_the_flag(self):
        """set_primary_image moves the primary flag to the given image."""
        first = add_product_image(self.product, image_url="https://res.cloudinary.com/x/a.jpg")
        second = add_product_image(self.product, image_url="https://res.cloudinary.com/x/b.jpg")
        set_primary_image(second)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertFalse(first.is_primary)
        self.assertTrue(second.is_primary)

    def test_deleting_the_primary_image_promotes_the_next_one(self):
        """Deleting the primary image promotes the next by sort order."""
        first = add_product_image(
            self.product, image_url="https://res.cloudinary.com/x/a.jpg", sort_order=1
        )
        second = add_product_image(
            self.product, image_url="https://res.cloudinary.com/x/b.jpg", sort_order=2
        )
        delete_product_image(first)
        second.refresh_from_db()
        self.assertTrue(second.is_primary)

    def test_deleting_a_non_primary_image_leaves_the_primary_alone(self):
        """Deleting a non-primary image doesn't change which image is primary."""
        first = add_product_image(self.product, image_url="https://res.cloudinary.com/x/a.jpg")
        second = add_product_image(self.product, image_url="https://res.cloudinary.com/x/b.jpg")
        delete_product_image(second)
        first.refresh_from_db()
        self.assertTrue(first.is_primary)

    def test_only_one_primary_image_is_allowed_at_the_database_level(self):
        """Creating a second primary image outside the service is rejected."""
        ProductImage.objects.create(
            product=self.product,
            image_url="https://res.cloudinary.com/x/a.jpg",
            is_primary=True,
        )
        with self.assertRaises(IntegrityError), transaction.atomic():
            ProductImage.objects.create(
                product=self.product,
                image_url="https://res.cloudinary.com/x/b.jpg",
                is_primary=True,
            )

    def test_deleting_a_product_deletes_its_images(self):
        """Images are removed when their product is deleted."""
        add_product_image(self.product, image_url="https://res.cloudinary.com/x/a.jpg")
        self.product.delete()
        self.assertEqual(ProductImage.objects.count(), 0)