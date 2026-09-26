"""Seed the database with default categories, hairstyles, and products."""

from decimal import Decimal
from django.core.management.base import BaseCommand
from catalog.models import Category, HairStyle, Product, ProductColor, ProductImage, ProductSize
from catalog.services import add_product_image, assign_slug


class Command(BaseCommand):
    help = "Seed the catalog with categories, hairstyles, and sample products."

    def handle(self, *args, **options):
        # 1. Categories
        categories_data = [
            {
                "name": "Human Hair",
                "slug": "human-hair",
                "image_url": "http://localhost:3000/7944b14b-3fd0-4899-8dbf-c03571669315.jpg",
                "seo_name": "Premium Human Hair Wigs",
                "seo_description": "Natural beauty, luxurious texture and timeless elegance.",
                "sort_order": 1,
            },
            {
                "name": "Japanese Futura",
                "slug": "futura",
                "image_url": "http://localhost:3000/6cac8a29-06d2-466c-b5ea-c7d4d8d00223.jpg",
                "seo_name": "Japanese Futura Fibre Wigs",
                "seo_description": "Beautiful, versatile and stylish fibre wigs for effortless looks.",
                "sort_order": 2,
            },
        ]

        categories = {}
        for cat_data in categories_data:
            slug = cat_data["slug"]
            cat, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": cat_data["name"],
                    "image_url": cat_data["image_url"],
                    "seo_name": cat_data["seo_name"],
                    "seo_description": cat_data["seo_description"],
                    "sort_order": cat_data["sort_order"],
                    "is_active": True,
                },
            )
            categories[slug] = cat
            action = "Created" if created else "Found"
            self.stdout.write(f"{action} category: {cat.name}")

        # 2. Hairstyles
        hairstyles_data = [
            {"name": "Straight", "slug": "straight", "sort_order": 1},
            {"name": "Body Wave", "slug": "body-wave", "sort_order": 2},
            {"name": "Deep Wave", "slug": "deep-wave", "sort_order": 3},
            {"name": "Curly", "slug": "curly", "sort_order": 4},
            {"name": "Bob", "slug": "bob", "sort_order": 5},
        ]

        hairstyles = {}
        for hs_data in hairstyles_data:
            slug = hs_data["slug"]
            hs, created = HairStyle.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": hs_data["name"],
                    "sort_order": hs_data["sort_order"],
                    "is_active": True,
                },
            )
            hairstyles[slug] = hs
            action = "Created" if created else "Found"
            self.stdout.write(f"{action} hairstyle: {hs.name}")

        # 3. Products
        products_data = [
            {
                "name": "Luxury Body Wave",
                "slug": "luxury-body-wave",
                "category": categories["human-hair"],
                "hairstyle": hairstyles["body-wave"],
                "sku": "DLH-001",
                "description": "The Luxury Body Wave is a premium human hair wig with a relaxed, flowing wave pattern that holds its shape through the day. Details such as density, cap construction and lace finish are configured per batch by the Dallian Luxe Hair team and confirmed at purchase.",
                "price": Decimal("24500.00"),
                "previous_price": Decimal("27000.00"),
                "stock_quantity": 18,
                "is_active": True,
                "is_featured": True,
                "images": [
                    "http://localhost:3000/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg",
                    "http://localhost:3000/c1286a5a-6feb-4873-afd4-180b44938f5d.jpg",
                    "http://localhost:3000/40609846-8a62-42e1-acfb-284505ec078e.jpg",
                ],
            },
            {
                "name": "Silky Straight",
                "slug": "silky-straight",
                "category": categories["human-hair"],
                "hairstyle": hairstyles["straight"],
                "sku": "DLH-002",
                "description": "Silky Straight is cut and finished for a sleek, polished silhouette. Length, colour and cap options can be selected below; all other specifications are maintained by the store administrator.",
                "price": Decimal("26800.00"),
                "previous_price": None,
                "stock_quantity": 12,
                "is_active": True,
                "is_featured": True,
                "images": [
                    "http://localhost:3000/2214af5c-9a6c-4846-b6aa-c860dc07471f.jpg",
                    "http://localhost:3000/5d42e680-c400-402a-ba6b-3f44329c43ec.jpg",
                    "http://localhost:3000/40609846-8a62-42e1-acfb-284505ec078e.jpg",
                ],
            },
            {
                "name": "Glueless Bob",
                "slug": "glueless-bob",
                "category": categories["futura"],
                "hairstyle": hairstyles["bob"],
                "sku": "DLH-003",
                "description": "Made from Japanese Futura fibre, the Glueless Bob keeps its blunt shape with minimal styling and is heat-friendly within the limits published in our Wig Care Guide.",
                "price": Decimal("12400.00"),
                "previous_price": None,
                "stock_quantity": 3,
                "is_active": True,
                "is_featured": False,
                "images": [
                    "http://localhost:3000/f1194d78-3143-40b7-8077-cc62ea396e67.jpg",
                    "http://localhost:3000/5d42e680-c400-402a-ba6b-3f44329c43ec.jpg",
                    "http://localhost:3000/2214af5c-9a6c-4846-b6aa-c860dc07471f.jpg",
                ],
            },
            {
                "name": "Deep Wave",
                "slug": "deep-wave",
                "category": categories["human-hair"],
                "hairstyle": hairstyles["deep-wave"],
                "sku": "DLH-004",
                "description": "Deep Wave delivers sculpted definition from root to tip. Wave pattern retention depends on the care routine described in our Wig Care Guide.",
                "price": Decimal("27900.00"),
                "previous_price": None,
                "stock_quantity": 9,
                "is_active": True,
                "is_featured": False,
                "images": [
                    "http://localhost:3000/c1286a5a-6feb-4873-afd4-180b44938f5d.jpg",
                    "http://localhost:3000/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg",
                    "http://localhost:3000/f9c35955-16ca-4e72-b5b6-36d9dac86f93.jpg",
                ],
            },
            {
                "name": "HD Lace Frontal",
                "slug": "hd-lace-frontal",
                "category": categories["human-hair"],
                "hairstyle": hairstyles["straight"],
                "sku": "DLH-005",
                "description": "Our HD Lace Frontal is finished for a soft, natural-looking hairline with a flexible parting space. Install support is available in store.",
                "price": Decimal("31500.00"),
                "previous_price": None,
                "stock_quantity": 7,
                "is_active": True,
                "is_featured": True,
                "images": [
                    "http://localhost:3000/40609846-8a62-42e1-acfb-284505ec078e.jpg",
                    "http://localhost:3000/2214af5c-9a6c-4846-b6aa-c860dc07471f.jpg",
                    "http://localhost:3000/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg",
                ],
            },
            {
                "name": "Elegant Curly",
                "slug": "elegant-curly",
                "category": categories["futura"],
                "hairstyle": hairstyles["curly"],
                "sku": "DLH-006",
                "description": "Elegant Curly is a Japanese Futura fibre piece with springy curl definition that bounces back after washing, following the routine in our Wig Care Guide.",
                "price": Decimal("14900.00"),
                "previous_price": Decimal("16500.00"),
                "stock_quantity": 21,
                "is_active": True,
                "is_featured": False,
                "images": [
                    "http://localhost:3000/f9c35955-16ca-4e72-b5b6-36d9dac86f93.jpg",
                    "http://localhost:3000/c1286a5a-6feb-4873-afd4-180b44938f5d.jpg",
                    "http://localhost:3000/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg",
                ],
            },
            {
                "name": "Classic Straight",
                "slug": "classic-straight",
                "category": categories["futura"],
                "hairstyle": hairstyles["straight"],
                "sku": "DLH-007",
                "description": "Classic Straight is an approachable Futura fibre wig for daily wear, with a soft side part and a lightweight glueless cap.",
                "price": Decimal("11800.00"),
                "previous_price": None,
                "stock_quantity": 0,
                "is_active": True,
                "is_featured": False,
                "images": [
                    "http://localhost:3000/5d42e680-c400-402a-ba6b-3f44329c43ec.jpg",
                    "http://localhost:3000/2214af5c-9a6c-4846-b6aa-c860dc07471f.jpg",
                    "http://localhost:3000/f1194d78-3143-40b7-8077-cc62ea396e67.jpg",
                ],
            },
        ]

        for p_data in products_data:
            slug = p_data.get("slug")
            imgs = p_data.pop("images", [])

            # Check if product exists by slug
            product = Product.objects.filter(slug=slug).first()
            if not product:
                product = Product(**p_data)
                product.save()
                self.stdout.write(f"Created product: {product.name}")
            else:
                # Update attributes if needed
                for field in [
                    "category",
                    "hairstyle",
                    "sku",
                    "description",
                    "price",
                    "previous_price",
                    "stock_quantity",
                    "is_active",
                    "is_featured",
                ]:
                    setattr(product, field, p_data[field])
                product.save()
                self.stdout.write(f"Updated product: {product.name}")

            # Ensure product has images
            if not product.images.exists():
                for idx, img_url in enumerate(imgs):
                    add_product_image(
                        product=product,
                        image_url=img_url,
                        is_primary=(idx == 0),
                        sort_order=idx,
                    )
            elif (
                product.images.filter(is_primary=True).exists()
                and product.images.filter(is_primary=True).first().image_url.startswith("https://res.cloudinary.com")
            ):
                # Preserve existing Cloudinary image
                pass

            # Ensure product has sample colors if none exist or attach images
            product_images = list(product.images.all())
            if not product.colors.exists():
                sample_colors = [
                    {"name": "Natural Black", "hex_code": "#0B0B0B", "stock_quantity": 10, "sort_order": 1, "image": product_images[0] if len(product_images) > 0 else None},
                    {"name": "Rich Chestnut", "hex_code": "#7A3F2B", "stock_quantity": 6, "sort_order": 2, "image": product_images[1] if len(product_images) > 1 else None},
                    {"name": "Deep Chestnut", "hex_code": "#5A2E22", "stock_quantity": 4, "sort_order": 3, "image": product_images[2] if len(product_images) > 2 else None},
                ]
                for sc in sample_colors:
                    ProductColor.objects.create(product=product, **sc)
            else:
                for idx, col in enumerate(product.colors.all()):
                    if not col.image and idx < len(product_images):
                        col.image = product_images[idx]
                        col.save(update_fields=["image"])

            # Ensure product has sample sizes if none exist
            if not product.sizes.exists():
                sample_sizes = [
                    {"name": "16\"", "stock_quantity": 5, "sort_order": 1},
                    {"name": "18\"", "stock_quantity": 8, "sort_order": 2},
                    {"name": "20\"", "stock_quantity": 6, "sort_order": 3},
                    {"name": "24\"", "stock_quantity": 4, "sort_order": 4},
                ]
                for ss in sample_sizes:
                    ProductSize.objects.create(product=product, **ss)

        self.stdout.write(self.style.SUCCESS("Successfully seeded catalog!"))
