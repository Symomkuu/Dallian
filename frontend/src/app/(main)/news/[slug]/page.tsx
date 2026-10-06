import React, { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsDetailClient } from '@/components/NewsDetailClient';
import { API_BASE_URL } from '@/utils/api';
import type { BlogPost } from '@/types';
import { brand } from '@/data/brand';
import { absoluteUrl, buildAuthorSchema, estimateWordCount, jsonLd } from '@/utils/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Memoized post getter to deduplicate metadata & page server component executions */
const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const res = await fetch(`${API_BASE_URL}/api/blog/posts/${slug}/`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Blog post API responded with status ${res.status}`);
  }
  return res.json();
});

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

/** Pre-render newest 50 articles at build time for optimal SSG & instant search engine indexing */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts/?page_size=50`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts: BlogPost[] = Array.isArray(data) ? data : data.results || [];
    return posts.map((post) => ({
      slug: post.slug,
    }));
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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = post.meta_title || `${post.title} | Dallian Luxe Hair Nairobi`;
  const description =
    post.meta_description ||
    post.excerpt ||
    `Read ${post.title} on Dallian Luxe Hair. Expert hair guides and beauty tips in Nairobi, Kenya.`;

  const coverImage = absoluteUrl(post.cover_image);

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
      title,
      description,
      url: `https://dallian.online/news/${slug}`,
      siteName: brand.name,
      locale: 'en_KE',
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
  const categorySlug =
    post.category_details?.slug ||
    (typeof post.category === 'object' ? post.category?.slug : undefined);
  const wordCount = estimateWordCount(post.content);
  const canonicalUrl = `https://dallian.online/news/${slug}`;
  const absoluteCoverImage = absoluteUrl(post.cover_image);
  const authorSchema = buildAuthorSchema(post.author_name);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    articleSection: categoryName,
    keywords: post.keywords || post.tags || undefined,
    inLanguage: 'en',
    wordCount,
    isAccessibleForFree: true,
    url: canonicalUrl,
    image: [absoluteCoverImage],
    thumbnailUrl: absoluteCoverImage,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: authorSchema,
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
  };

  const breadcrumbsElements = [
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
  ];

  if (categoryName && categorySlug) {
    breadcrumbsElements.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryName,
      item: `https://dallian.online/news/category/${categorySlug}`,
    });
    breadcrumbsElements.push({
      '@type': 'ListItem',
      position: 4,
      name: post.title,
      item: canonicalUrl,
    });
  } else {
    breadcrumbsElements.push({
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: canonicalUrl,
    });
  }

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbsElements,
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
        {jsonLd(articleSchema)}
      </script>
      <script type="application/ld+json" key="article-breadcrumbs-jsonld">
        {jsonLd(breadcrumbsSchema)}
      </script>
      <NewsDetailClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
