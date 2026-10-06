import type { Metadata } from 'next';
import { NewsPageClient } from '@/components/NewsPageClient';
import { API_BASE_URL } from '@/utils/api';
import type { BlogPost, BlogCategory } from '@/types';
import { brand } from '@/data/brand';
import { absoluteUrl, buildAuthorSchema, jsonLd } from '@/utils/seo';

export const metadata: Metadata = {
  // The root layout template appends " | Dallian Luxe Hair Nairobi"
  title: 'Latest News & Hair Guides',
  description:
    'Read expert wig maintenance tips, HD lace care rituals, virgin hair trends, and salon styling secrets from Dallian Luxe Hair in Nairobi, Kenya.',
  alternates: {
    canonical: 'https://dallian.online/news',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Latest News & Hair Care Guides | Dallian Luxe Hair Studio Nairobi',
    description:
      'Expert advice on virgin hair wigs, HD lace care, and luxury styling rituals in Nairobi, Kenya.',
    url: 'https://dallian.online/news',
    siteName: brand.name,
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: 'https://dallian.online/shop-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Dallian Luxe Hair Journal & News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest News & Hair Care Guides | Dallian Luxe Hair Nairobi',
    description:
      'Expert advice on virgin hair wigs, HD lace care, and luxury styling rituals in Nairobi, Kenya.',
    images: ['https://dallian.online/shop-hero.jpg'],
  },
};

async function getBlogData() {
  const [postsRes, catRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/blog/posts/?page_size=50`, {
      next: { revalidate: 60 },
    }),
    fetch(`${API_BASE_URL}/api/blog/categories/`, {
      next: { revalidate: 300 },
    }),
  ]);

  // Posts are essential: throw so Next keeps serving the last good cached page
  // instead of caching an empty listing.
  if (!postsRes.ok) {
    throw new Error(`Blog posts API failed with status ${postsRes.status}`);
  }
  const postsData = await postsRes.json();
  const initialPosts: BlogPost[] = Array.isArray(postsData)
    ? postsData
    : Array.isArray(postsData.results)
    ? postsData.results
    : [];

  // Categories are secondary: a failure here must not take the whole page down.
  let categories: BlogCategory[] = [];
  if (catRes.ok) {
    try {
      const catData = await catRes.json();
      categories = Array.isArray(catData) ? catData : [];
    } catch (err) {
      console.error('Failed to parse blog categories JSON:', err);
    }
  } else {
    console.error(`Blog categories API failed with status ${catRes.status}`);
  }

  return { initialPosts, categories };
}

export default async function NewsListingPage() {
  const { initialPosts, categories } = await getBlogData();

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Dallian Luxe Hair Journal & News',
    url: 'https://dallian.online/news',
    description:
      'Professional hair guides, HD lace maintenance tutorials, and luxury wig insights from Nairobi, Kenya.',
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
    blogPost: initialPosts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://dallian.online/news/${post.slug}`,
      image: absoluteUrl(post.cover_image),
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at || post.published_at || post.created_at,
      articleSection:
        post.category_details?.name ||
        (typeof post.category === 'object' && post.category !== null
          ? post.category.name
          : undefined),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://dallian.online/news/${post.slug}`,
      },
      author: buildAuthorSchema(post.author_name),
    })),
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
    ],
  };

  return (
    <>
      <script type="application/ld+json" key="news-list-jsonld">
        {jsonLd(blogListSchema)}
      </script>
      <script type="application/ld+json" key="news-breadcrumbs-jsonld">
        {jsonLd(breadcrumbsSchema)}
      </script>
      <NewsPageClient initialPosts={initialPosts} categories={categories} />
    </>
  );
}