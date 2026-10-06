import type { MetadataRoute } from 'next';
import { servicesData } from '@/data/services';
import { API_BASE_URL } from '@/utils/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dallian.online';
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/services`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wig-care`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/track`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // Dynamic Service Detail Pages
  const serviceRoutes: MetadataRoute.Sitemap = servicesData.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic Product Pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/store/products/?page_size=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        productRoutes = data.results.map((product: { slug: string; updated_at?: string }) => ({
          url: `${baseUrl}/product/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : lastModified,
          changeFrequency: 'daily',
          priority: 0.8,
        }));
      }
    }
  } catch {
    // Backend offline during build fallback
  }

  // Dynamic Blog News Pages
  const blogRoutes: MetadataRoute.Sitemap = [];
  try {
    let nextUrl: string | null = `${API_BASE_URL}/api/blog/posts/?page_size=50`;
    while (nextUrl) {
      const res: Response = await fetch(nextUrl, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = await res.json();
      const posts = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
      const routes: MetadataRoute.Sitemap = posts.map(
        (post: { slug: string; updated_at?: string; published_at?: string }) => ({
          url: `${baseUrl}/news/${post.slug}`,
          lastModified: post.updated_at
            ? new Date(post.updated_at)
            : post.published_at
            ? new Date(post.published_at)
            : lastModified,
          changeFrequency: 'weekly',
          priority: 0.85,
        })
      );
      blogRoutes.push(...routes);
      nextUrl = data && typeof data === 'object' && !Array.isArray(data) && data.next ? data.next : null;
    }
  } catch {
    // Backend offline during build fallback
  }

  // Dynamic Blog Category Pages
  const blogCategoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const catRes = await fetch(`${API_BASE_URL}/api/blog/categories/`, {
      next: { revalidate: 3600 },
    });
    if (catRes.ok) {
      const catData = await catRes.json();
      const categories: { slug: string }[] = Array.isArray(catData) ? catData : [];
      for (const cat of categories) {
        blogCategoryRoutes.push({
          url: `${baseUrl}/news/category/${cat.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch {
    // Backend offline during build fallback
  }

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...blogCategoryRoutes,
  ];
}
