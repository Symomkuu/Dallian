import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { API_BASE_URL, formatProductFromBackend, type StoreProductDetail } from '@/utils/api';
import { brand } from '@/data/brand';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/products/${slug}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data: StoreProductDetail = await res.json();
    return formatProductFromBackend(data);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Wigs in Nairobi | Dallian Luxe Hair',
      description: 'Shop lace front wigs, bob wigs and human hair wigs at Dallian Luxe Hair, Nairobi. Delivery across Kenya.',
    };
  }

  const title = `${product.name} | Dallian Luxe Hair Nairobi`;
  const description = product.description
    ? product.description.length > 155
      ? `${product.description.slice(0, 155).trim()}...`
      : product.description
    : `Shop ${product.name} at Dallian Luxe Hair Nairobi.`;

  const primaryImage = product.images?.[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `https://dallian.online${product.images[0]}`
    : 'https://dallian.online/logo.png';

  return {
    title,
    description,
    alternates: {
      canonical: `https://dallian.online/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://dallian.online/product/${slug}`,
      siteName: brand.name,
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images.map((img) =>
          img.startsWith('http') ? img : `https://dallian.online${img}`
        ),
        description: product.description || `${product.name} wig by Dallian Luxe Hair, Nairobi.`,
        sku: product.id,
        brand: {
          '@type': 'Brand',
          name: 'Dallian Luxe Hair',
        },
        offers: {
          '@type': 'Offer',
          url: `https://dallian.online/product/${slug}`,
          priceCurrency: 'KES',
          price: product.price,
          priceValidUntil: '2028-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability:
            product.availability === 'out-of-stock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Dallian Luxe Hair',
          },
        },
        ...(product.rating > 0 && product.reviewCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            }
          : {}),
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://dallian.online',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://dallian.online/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product?.name || 'Product',
        item: `https://dallian.online/product/${slug}`,
      },
    ],
  };

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          key="product-jsonld"
        >
          {JSON.stringify(productSchema)}
        </script>
      )}
      <script
        type="application/ld+json"
        key="product-breadcrumb-jsonld"
      >
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <Suspense
        fallback={
          <div className="mx-auto max-w-page px-5 py-20 sm:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/3 rounded bg-ink/10" />
              <div className="h-72 w-full rounded-lg bg-ink/5" />
            </div>
          </div>
        }
      >
        <ProductDetailClient slug={slug} initialProduct={product} />
      </Suspense>
    </>
  );
}