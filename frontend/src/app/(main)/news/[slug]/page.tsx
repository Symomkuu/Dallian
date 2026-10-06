import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsDetailClient } from '@/components/NewsDetailClient';
import { API_BASE_URL } from '@/utils/api';
import type { BlogPost } from '@/types';
import { brand } from '@/data/brand';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts/${slug}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getFallbackRelatedPosts(excludeSlug: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts: BlogPost[] = Array.isArray(data) ? data : data.results || [];
    return posts.filter((p) => p.slug !== excludeSlug).slice(0, 4);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Dallian Luxe Hair Nairobi',
      description: 'The requested hair guide or news story could not be found.',
    };
  }

  const title = post.meta_title || `${post.title} | Dallian Luxe Hair Nairobi`;
  const description =
    post.meta_description ||
    post.excerpt ||
    `Read ${post.title} on Dallian Luxe Hair. Expert hair guides and beauty tips in Nairobi, Kenya.`;

  const coverImage = post.cover_image
    ? post.cover_image.startsWith('http')
      ? post.cover_image
      : `https://dallian.online${post.cover_image}`
    : 'https://dallian.online/shop-hero.jpg';

  const keywordsList = post.keywords
    ? post.keywords.split(',').map((k) => k.trim())
    : [
        'hair guide nairobi',
        'wig care kenya',
        'hd lace wigs',
        'human hair wigs nairobi',
        'dallian luxe hair studio',
      ];

  return {
    title,
    description,
    keywords: keywordsList,
    alternates: {
      canonical: `https://dallian.online/news/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://dallian.online/news/${slug}`,
      siteName: brand.name,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || post.published_at || post.created_at,
      section:
        post.category_details?.name ||
        (typeof post.category === 'object' ? post.category?.name : undefined),
      tags: post.tags
        ? post.tags.split(',').map((t) => t.trim())
        : undefined,
      authors: [post.author_name || 'Dallian Luxe Hair Studio'],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverImage],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const categoryName =
    post.category_details?.name ||
    (typeof post.category === 'object' ? post.category?.name : undefined);
  const wordCount = post.content ? post.content.trim().split(/\s+/).length : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    articleSection: categoryName,
    keywords: post.keywords || post.tags || undefined,
    inLanguage: 'en',
    wordCount,
    image: post.cover_image
      ? [post.cover_image]
      : ['https://dallian.online/shop-hero.jpg'],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://dallian.online/news/${slug}`,
    },
    author: {
      '@type': 'Person',
      name: post.author_name || 'Dallian Luxe Studio',
    },
    publisher: {
      '@type': 'Organization',
      name: brand.name,
      logo: {
        '@type': 'ImageObject',
        url: 'https://dallian.online/logo.png',
      },
    },
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
        name: 'Latest News',
        item: 'https://dallian.online/news',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://dallian.online/news/${slug}`,
      },
    ],
  };

  const relatedPosts: BlogPost[] = post.related_posts ? [...post.related_posts] : [];
  if (relatedPosts.length < 4) {
    const fallback = await getFallbackRelatedPosts(slug);
    const existingSlugs = new Set([post.slug, ...relatedPosts.map((p) => p.slug)]);
    for (const item of fallback) {
      if (!existingSlugs.has(item.slug)) {
        relatedPosts.push(item);
        existingSlugs.add(item.slug);
      }
      if (relatedPosts.length >= 4) break;
    }
  }

  return (
    <>
      <script type="application/ld+json" key="article-schema-jsonld">
        {JSON.stringify(articleSchema)}
      </script>
      <script type="application/ld+json" key="article-breadcrumbs-jsonld">
        {JSON.stringify(breadcrumbsSchema)}
      </script>
      <NewsDetailClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
