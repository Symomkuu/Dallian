import { brand } from '@/data/brand';

/**
 * Escape '<' to prevent breaking out of <script type="application/ld+json">
 * and safeguard against XSS or parsing crashes from user/API-generated content.
 */
export const jsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');

/** Single fallback used for every byline, schema author and author box. */
export const DEFAULT_AUTHOR_NAME = 'Dallian Luxe Hair Studio';

/**
 * Next/Image optimisation switch. Stays OFF (unoptimized) until you allow your
 * API/media host in next.config `images.remotePatterns` and set
 * NEXT_PUBLIC_IMAGE_OPTIMIZATION=on. Then every <Image> gets WebP/AVIF + srcset.
 */
export const IMAGE_UNOPTIMIZED = process.env.NEXT_PUBLIC_IMAGE_OPTIMIZATION !== 'on';

/**
 * Ensure an image or resource path is fully qualified with the production domain.
 */
export const absoluteUrl = (
  path?: string | null,
  fallback = 'https://dallian.online/shop-hero.jpg'
): string => {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('//')) return `https:${path}`;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `https://dallian.online${cleanPath}`;
};

const STUDIO_AUTHOR_NAMES = new Set([
  'dallian luxe hair studio',
  'dallian luxe studio',
  'dallian luxe editorial team',
  'dallian editorial team',
  'editorial team',
  'dallian luxe hair',
  'dallian luxe',
  'admin',
]);

/**
 * Shared Schema.org Author builder adhering to Google E-E-A-T recommendations.
 * Uses exact matching for studio team identities instead of broad regexes.
 */
export function buildAuthorSchema(authorName?: string | null) {
  const trimmed = authorName?.trim();
  const isStudio = !trimmed || STUDIO_AUTHOR_NAMES.has(trimmed.toLowerCase());

  if (isStudio) {
    return {
      '@type': 'Organization',
      name: trimmed || DEFAULT_AUTHOR_NAME,
      url: 'https://dallian.online',
      sameAs: [
        brand.socials.instagram,
        brand.socials.tiktok,
        brand.socials.facebook,
      ].filter(Boolean),
    };
  }

  return {
    '@type': 'Person',
    name: trimmed,
    url: 'https://dallian.online/about',
    worksFor: {
      '@type': 'Organization',
      name: brand.name,
      url: 'https://dallian.online',
    },
  };
}

/**
 * Accurately calculate word count by stripping HTML and markdown tokens first.
 */
export function estimateWordCount(content?: string): number | undefined {
  if (!content) return undefined;
  const clean = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`~_>]/g, ' ')
    .trim();
  return clean ? clean.split(/\s+/).length : undefined;
}