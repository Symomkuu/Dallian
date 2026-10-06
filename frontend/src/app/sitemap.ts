import type { MetadataRoute } from 'next';
import { servicesData } from '@/data/services';
import { API_BASE_URL } from '@/utils/api';

// Rebuild the sitemap hourly so an API outage at build time can't freeze it empty.
export const revalidate = 3600;

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl = (
  rawSiteUrl && rawSiteUrl.startsWith('http') ? rawSiteUrl : 'https://dallian.online'
).replace(/\/+$/, '');

/** A category needs at least this many posts to be indexable (matches the category page's noindex rule). */
const MIN_POSTS_PER_CATEGORY = 2;
const MAX_PAGES = 50;

interface ApiCategoryRef {
  slug?: string;
}

/** The fields of a blog post or product that the sitemap reads. */
interface ApiItem {
  slug?: string;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  category?: ApiCategoryRef | number | string | null;
  category_details?: ApiCategoryRef | null;
}

/**
 * Fetch every page of a DRF-style list endpoint. Builds page URLs itself instead
 * of following `data.next`, which behind a proxy can be http:// or an internal host.
 */
async function fetchAll(path: string, pageSize: number): Promise<ApiItem[]> {
  const items: ApiItem[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${API_BASE_URL}${path}${sep}page_size=${pageSize}&page=${page}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;
    const data = await res.json();
    const results: ApiItem[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : [];
    items.push(...results);
    // Plain arrays are unpaginated; paginated responses stop when there is no `next`.
    if (Array.isArray(data) || !data?.next || results.length === 0) break;
  }
  return items;
}

const toDate = (...values: Array<string | null | undefined>): Date | undefined => {
  for (const v of values) {
    if (!v) continue;
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
  }
  return undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Blog posts (+ per-category stats for the category pages)
  const blogRoutes: MetadataRoute.Sitemap = [];
  const categoryStats = new Map<string, { count: number; latest: Date | undefined }>();
  let newestPost: Date | undefined;

  try {
    const posts = await fetchAll('/api/blog/posts/', 50);
    for (const post of posts) {
      if (!post.slug) continue;
      const modified = toDate(post.updated_at, post.published_at, post.created_at);
      blogRoutes.push({
        url: `${siteUrl}/news/${post.slug}`,
        ...(modified && { lastModified: modified }),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
      if (modified && (!newestPost || modified > newestPost)) newestPost = modified;

      const catSlug: string | undefined =
        post.category_details?.slug ??
        (typeof post.category === 'object' && post.category ? post.category.slug : undefined);
      if (catSlug) {
        const prev = categoryStats.get(catSlug);
        categoryStats.set(catSlug, {
          count: (prev?.count ?? 0) + 1,
          latest: prev?.latest && modified && prev.latest > modified ? prev.latest : modified ?? prev?.latest,
        });
      }
    }
  } catch {
    // Backend offline: fall back to whatever we collected
  }

  // Only categories that the category page will actually index
  const blogCategoryRoutes: MetadataRoute.Sitemap = [...categoryStats.entries()]
    .filter(([, s]) => s.count >= MIN_POSTS_PER_CATEGORY)
    .map(([slug, s]) => ({
      url: `${siteUrl}/news/category/${slug}`,
      ...(s.latest && { lastModified: s.latest }),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchAll('/api/store/products/', 100);
    productRoutes = products
      .filter((p) => p.slug)
      .map((p) => {
        const modified = toDate(p.updated_at);
        return {
          url: `${siteUrl}/product/${p.slug}`,
          ...(modified && { lastModified: modified }),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
  } catch {
    // Backend offline: fall back to no product URLs
  }

  // Static pages: no fake lastModified, so real dates elsewhere stay trustworthy.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/shop`, changeFrequency: 'daily', priority: 0.95 },
    { url: `${siteUrl}/services`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/categories`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${siteUrl}/delivery`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/returns`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${siteUrl}/news`,
      ...(newestPost && { lastModified: newestPost }),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.4 },
    // /track is intentionally omitted (utility page, not meant to rank)
  ];

  const serviceRoutes: MetadataRoute.Sitemap = servicesData.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...blogCategoryRoutes,
  ];
}