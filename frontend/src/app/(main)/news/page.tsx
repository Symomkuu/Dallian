import type { Metadata } from 'next';
import { NewsPageClient } from '@/components/NewsPageClient';
import { API_BASE_URL } from '@/utils/api';
import type { BlogPost, BlogCategory } from '@/types';
import { brand } from '@/data/brand';

export const metadata: Metadata = {
  title: 'Latest News & Hair Guides | Dallian Luxe Hair Studio Nairobi',
  description:
    'Read expert wig maintenance tips, HD lace care rituals, virgin hair trends, and salon styling secrets from Dallian Luxe Hair in Nairobi, Kenya.',
  keywords: [
    'wig care tips nairobi',
    'how to care for hd lace kenya',
    'virgin human hair maintenance',
    'bone straight wigs nairobi',
    'glueless wigs kenya',
    'wig revamping salon thika road',
    'dallian luxe hair journal',
    'hair trends nairobi',
  ],
  alternates: {
    canonical: 'https://dallian.online/news',
  },
  openGraph: {
    title: 'Latest News & Hair Care Guides | Dallian Luxe Hair Studio Nairobi',
    description:
      'Expert advice on virgin hair wigs, HD lace care, and luxury styling rituals in Nairobi, Kenya.',
    url: 'https://dallian.online/news',
    siteName: brand.name,
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
  let initialPosts: BlogPost[] = [];
  let categories: BlogCategory[] = [];

  const [postsRes, catRes] = await Promise.allSettled([
    fetch(`${API_BASE_URL}/api/blog/posts/?page_size=50`, {
      next: { revalidate: 60 },
    }),
    fetch(`${API_BASE_URL}/api/blog/categories/`, {
      next: { revalidate: 300 },
    }),
  ]);

  if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
    try {
      const postsData = await postsRes.value.json();
      initialPosts = Array.isArray(postsData)
        ? postsData
        : Array.isArray(postsData.results)
        ? postsData.results
        : [];
    } catch {
      // JSON parse fallback
    }
  }

  if (catRes.status === 'fulfilled' && catRes.value.ok) {
    try {
      const catData = await catRes.value.json();
      categories = Array.isArray(catData) ? catData : [];
    } catch {
      // JSON parse fallback
    }
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
    publisher: {
      '@type': 'Organization',
      name: brand.name,
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
      image: post.cover_image || 'https://dallian.online/shop-hero.jpg',
      datePublished: post.published_at || post.created_at,
      author: {
        '@type': 'Person',
        name: post.author_name || 'Dallian Luxe Stylists',
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" key="news-list-jsonld">
        {JSON.stringify(blogListSchema)}
      </script>
      <NewsPageClient initialPosts={initialPosts} categories={categories} />
    </>
  );
}
