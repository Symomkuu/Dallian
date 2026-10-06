import React, { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsPageClient } from '@/components/NewsPageClient';
import { API_BASE_URL } from '@/utils/api';
import type { BlogPost, BlogCategory } from '@/types';
import { brand } from '@/data/brand';
import { jsonLd } from '@/utils/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

/** Memoized category & post getter to deduplicate metadata & page server component executions */
const getCategoryData = cache(async (slug: string) => {
  const [postsRes, catRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/blog/posts/?category=${slug}&page_size=50`, {
      next: { revalidate: 60 },
    }),
    fetch(`${API_BASE_URL}/api/blog/categories/`, {
      next: { revalidate: 300 },
    }),
  ]);

  if (catRes.status === 404) {
    return { posts: [], categories: [], currentCategory: null };
  }
  if (!catRes.ok) {
    throw new Error(`Blog categories API responded with status ${catRes.status}`);
  }

  const catData = await catRes.json();
  const categories: BlogCategory[] = Array.isArray(catData) ? catData : [];
  const currentCategory = categories.find((c) => c.slug === slug) || null;

  if (!currentCategory) {
    return { posts: [], categories, currentCategory: null };
  }

  let posts: BlogPost[] = [];
  if (postsRes.status === 404) {
    posts = [];
  } else if (!postsRes.ok) {
    throw new Error(`Blog posts by category API responded with status ${postsRes.status}`);
  } else {
    const postsData = await postsRes.json();
    posts = Array.isArray(postsData)
      ? postsData
      : Array.isArray(postsData.results)
      ? postsData.results
      : [];
  }

  return { posts, categories, currentCategory };
});

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/categories/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const categories: BlogCategory[] = Array.isArray(data) ? data : [];
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { currentCategory, posts } = await getCategoryData(slug);

  if (!currentCategory) {
    return {
      title: 'Category Not Found | Dallian Luxe Hair Nairobi',
      description: 'The requested category of hair guides could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${currentCategory.name} Guides & Articles | Dallian Luxe Hair Nairobi`;
  const description =
    currentCategory.description ||
    `Browse expert ${currentCategory.name.toLowerCase()} guides, maintenance advice, and tutorials from Dallian Luxe Studio in Nairobi, Kenya.`;

  // Prevent thin indexation if category only has 0 or 1 post, but allow crawlers to follow links
  const shouldIndex = posts.length > 1;

  return {
    title,
    description,
    alternates: {
      canonical: `https://dallian.online/news/category/${slug}`,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://dallian.online/news/category/${slug}`,
      siteName: brand.name,
      locale: 'en_KE',
      type: 'website',
      images: [
        {
          url: 'https://dallian.online/shop-hero.jpg',
          width: 1200,
          height: 630,
          alt: `${currentCategory.name} Hair Guides`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://dallian.online/shop-hero.jpg'],
    },
  };
}

export default async function CategoryNewsPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { posts, categories, currentCategory } = await getCategoryData(slug);

  if (!currentCategory) {
    notFound();
  }

  const categoryUrl = `https://dallian.online/news/category/${slug}`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${currentCategory.name} - Hair Guides & News`,
    description:
      currentCategory.description ||
      `Articles and care tutorials regarding ${currentCategory.name} in Nairobi, Kenya.`,
    url: categoryUrl,
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://dallian.online/#organization',
      name: brand.name,
      url: 'https://dallian.online',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dallian.online/logo.png',
      },
    },
    ...(posts.length > 0
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: posts.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: post.title,
              url: `https://dallian.online/news/${post.slug}`,
            })),
          },
        }
      : {}),
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://dallian.online/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Hair Guides & News',
        item: 'https://dallian.online/news',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: currentCategory.name,
        item: categoryUrl,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="cat-collection-jsonld">
        {jsonLd(collectionSchema)}
      </script>
      <script type="application/ld+json" key="cat-breadcrumbs-jsonld">
        {jsonLd(breadcrumbsSchema)}
      </script>
      <NewsPageClient
        initialPosts={posts}
        categories={categories}
        initialCategory={slug}
        categoryTitle={`${currentCategory.name} Guides & News`}
        categoryDescription={
          currentCategory.description ||
          `Browse expert ${currentCategory.name.toLowerCase()} guides, maintenance advice, and tutorials from Dallian Luxe Studio in Nairobi.`
        }
      />
    </>
  );
}
