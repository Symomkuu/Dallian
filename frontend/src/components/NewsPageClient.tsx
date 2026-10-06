'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ClockIcon,
  Loader2Icon,
  MessageCircleIcon,
  SearchIcon,
} from 'lucide-react';
import type { BlogCategory, BlogPost } from '@/types';
import { fetchBlogPosts } from '@/utils/api';
import { cx, formatDate } from '@/utils/format';
import { brand } from '@/data/brand';
import { DEFAULT_AUTHOR_NAME, IMAGE_UNOPTIMIZED } from '@/utils/seo';

/** Must match the page_size used by the server pages (50). */
const PAGE_SIZE = 50;

interface NewsPageClientProps {
  initialPosts: BlogPost[];
  categories: BlogCategory[];
  initialCategory?: string;
  categoryTitle?: string;
  categoryDescription?: string;
}

function getCategoryName(post?: BlogPost | null): string | null {
  if (!post) return null;
  if (post.category_details?.name) return post.category_details.name;
  if (typeof post.category === 'object' && post.category?.name) return post.category.name;
  return null;
}

export function NewsPageClient({
  initialPosts,
  categories,
  initialCategory = 'all',
  categoryTitle,
  categoryDescription,
}: NewsPageClientProps) {
  // On /news/category/[slug] the route decides the category. Pills are real
  // links, and the category page passes key={slug} so this remounts per category.
  const selectedCategory = initialCategory;
  const hasInitialCategory = initialCategory !== 'all';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  // Default view (/news): server-rendered posts + "load more"
  const [defaultPosts, setDefaultPosts] = useState<BlogPost[]>(hasInitialCategory ? [] : initialPosts);
  const [defaultPage, setDefaultPage] = useState<number>(1);
  const [defaultHasMore, setDefaultHasMore] = useState<boolean>(
    !hasInitialCategory && initialPosts.length >= PAGE_SIZE
  );

  // Category / search view. Category pages start from the server-rendered posts
  // so the first HTML response contains the article links.
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(hasInitialCategory ? initialPosts : []);
  const [filteredPage, setFilteredPage] = useState<number>(1);
  const [filteredHasMore, setFilteredHasMore] = useState<boolean>(
    hasInitialCategory && initialPosts.length >= PAGE_SIZE
  );
  // Which "category|query" the filteredPosts currently belong to
  const [loadedKey, setLoadedKey] = useState<string | null>(
    hasInitialCategory ? `${initialCategory}|` : null
  );

  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // If initialPosts was empty (e.g. backend was unavailable at build time),
  // fetch live articles upon client mount
  useEffect(() => {
    if (!hasInitialCategory && defaultPosts.length === 0) {
      fetchBlogPosts({ page: 1, page_size: PAGE_SIZE })
        .then((res) => {
          if (res.results && res.results.length > 0) {
            setDefaultPosts(res.results);
            setDefaultHasMore(Boolean(res.next));
          }
        })
        .catch(() => {});
    }
  }, [hasInitialCategory, defaultPosts.length]);

  const isDefaultView = selectedCategory === 'all' && !debouncedQuery;
  const viewKey = `${selectedCategory}|${debouncedQuery}`;
  const posts = isDefaultView ? defaultPosts : filteredPosts;
  const hasMore = isDefaultView ? defaultHasMore : filteredHasMore;
  const isSearching =
    (!isDefaultView && loadedKey !== viewKey) || searchQuery.trim() !== debouncedQuery;

  // Fetch only when the view differs from what we already hold
  useEffect(() => {
    if (isDefaultView || loadedKey === viewKey) return;

    let isCurrent = true;

    fetchBlogPosts({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: debouncedQuery || undefined,
      page: 1,
      page_size: PAGE_SIZE,
    })
      .then((res) => {
        if (!isCurrent) return;
        setFilteredPosts(res.results || []);
        setFilteredPage(1);
        setFilteredHasMore(Boolean(res.next));
        setLoadedKey(viewKey);
      })
      .catch((err) => {
        console.error('Failed to filter blog posts:', err);
        if (!isCurrent) return;
        setFilteredPosts([]);
        setFilteredHasMore(false);
        setLoadedKey(viewKey);
      });

    return () => {
      isCurrent = false;
    };
  }, [isDefaultView, loadedKey, viewKey, selectedCategory, debouncedQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      if (isDefaultView) {
        const nextPage = defaultPage + 1;
        const res = await fetchBlogPosts({ page: nextPage, page_size: PAGE_SIZE });
        const newItems = res.results || [];
        setDefaultPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          return [...prev, ...newItems.filter((p) => !existingIds.has(p.id))];
        });
        setDefaultPage(nextPage);
        setDefaultHasMore(Boolean(res.next));
      } else {
        const nextPage = filteredPage + 1;
        const res = await fetchBlogPosts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: debouncedQuery || undefined,
          page: nextPage,
          page_size: PAGE_SIZE,
        });
        const newItems = res.results || [];
        setFilteredPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          return [...prev, ...newItems.filter((p) => !existingIds.has(p.id))];
        });
        setFilteredPage(nextPage);
        setFilteredHasMore(Boolean(res.next));
      }
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Strictly sort posts by newest first (published_at or created_at)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return timeB - timeA;
    });
  }, [posts]);

  // Featured hero article (shown only in default view when browsing "all" without active search)
  const featuredPost = useMemo(() => {
    if (!isDefaultView) return null;
    return sortedPosts.find((p) => p.is_featured) || sortedPosts[0];
  }, [sortedPosts, isDefaultView]);

  // Grid posts: excluding featured if default view, otherwise show all matching posts
  const gridPosts = useMemo(() => {
    if (!featuredPost) return sortedPosts;
    return sortedPosts.filter((p) => p.id !== featuredPost.id);
  }, [sortedPosts, featuredPost]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-black py-16 sm:py-24 text-white">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="/shop-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-page px-4 sm:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D99B26]">
            The Dallian Journal
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal">
            {categoryTitle || 'Latest News & Hair Guides'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/70 leading-relaxed font-light">
            {categoryDescription ||
              "Expert care rituals, luxury virgin hair trends, and studio secrets straight from Nairobi's premier wig artisans."}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-page px-4 py-10 sm:px-8 sm:py-16">
        {/* Featured Story Hero (when browsing all without query) */}
        {featuredPost && (
          <div className="mb-14">
            <div className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card transition-all duration-300 hover:shadow-lg">
              <div className="grid lg:grid-cols-12 items-stretch">
                <div className="relative min-h-[280px] lg:min-h-[420px] lg:col-span-7 overflow-hidden bg-neutral-900">
                  <Image
                    src={featuredPost.cover_image || '/shop-hero.jpg'}
                    alt={featuredPost.title}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority
                    unoptimized={IMAGE_UNOPTIMIZED}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 inline-flex items-center rounded-full bg-[#D99B26] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-black shadow-sm">
                    Featured Story
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-5">
                  <div>
                    {getCategoryName(featuredPost) && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8B3A2A]">
                        {getCategoryName(featuredPost)}
                      </span>
                    )}

                    <Link href={`/news/${featuredPost.slug}`}>
                      <h2 className="mt-2.5 font-serif text-2xl sm:text-3xl text-ink leading-snug font-normal hover:text-[#8B3A2A] transition-colors">
                        {featuredPost.title}
                      </h2>
                    </Link>

                    <p className="mt-3.5 text-sm sm:text-base text-ink/70 leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-ink/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs text-ink/60">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {featuredPost.read_time_minutes} min read
                      </span>
                      <span>•</span>
                      <span>
                        {featuredPost.published_at
                          ? formatDate(featuredPost.published_at)
                          : formatDate(featuredPost.created_at)}
                      </span>
                    </div>

                    <Link
                      href={`/news/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B3A2A] hover:text-[#D99B26] transition-colors"
                    >
                      Read Full Story
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Bar & Search Filter */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-ink/10 pb-6">
          {/* Category Pills */}
          <nav aria-label="Article categories" className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Link
              href="/news"
              className={cx(
                'whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
                selectedCategory === 'all'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-ink/70 border border-ink/10 hover:border-ink/30 hover:text-ink'
              )}
            >
              All Stories
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/news/category/${cat.slug}`}
                className={cx(
                  'whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
                  selectedCategory === cat.slug
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-ink/70 border border-ink/10 hover:border-ink/30 hover:text-ink'
                )}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            {isSearching ? (
              <Loader2Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#D99B26]" />
            ) : (
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            )}
            <input
              type="text"
              aria-label="Search guides and news"
              placeholder="Search guides & news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink/40 shadow-2xs focus:border-[#D99B26] focus:outline-none focus:ring-1 focus:ring-[#D99B26]"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {sortedPosts.length === 0 && !isSearching ? (
          <div className="rounded-3xl border border-ink/10 bg-white p-12 text-center shadow-card">
            <BookOpenIcon className="mx-auto h-12 w-12 text-ink/20" />
            <h3 className="mt-4 font-serif text-xl text-ink">No articles match your search</h3>
            <p className="mt-2 text-sm text-ink/60">
              Try adjusting your search terms or category filter to find other guides.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 rounded-full bg-[#D99B26] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black shadow-xs hover:bg-[#c88d1f]"
            >
              Reset Filters
            </button>
          </div>
        ) : gridPosts.length > 0 ? (
          <div className={cx('grid grid-cols-2 gap-3 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3', isSearching && 'opacity-60 transition-opacity')}>
            {gridPosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-ink/10 bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                {/* Card Thumbnail */}
                <Link
                  href={`/news/${post.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900"
                >
                  <Image
                    src={post.cover_image || '/shop-hero.jpg'}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={IMAGE_UNOPTIMIZED}
                  />
                  {getCategoryName(post) && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-white/95 px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8B3A2A] shadow-xs backdrop-blur">
                      {getCategoryName(post)}
                    </span>
                  )}
                </Link>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-3 sm:p-6">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-ink/50">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#D99B26]" />
                        {post.read_time_minutes} min read
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">
                        {post.published_at
                          ? formatDate(post.published_at)
                          : formatDate(post.created_at)}
                      </span>
                    </div>

                    <Link href={`/news/${post.slug}`}>
                      <h3 className="mt-1 sm:mt-2.5 font-serif text-xs sm:text-lg text-ink font-normal leading-snug group-hover:text-[#8B3A2A] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="mt-1.5 text-xs text-ink/65 leading-relaxed line-clamp-2 hidden sm:block">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-2.5 sm:mt-5 pt-2 sm:pt-4 border-t border-ink/5 flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="hidden sm:inline text-[11px] text-ink/50 font-medium truncate max-w-[120px]">
                      By {post.author_name || DEFAULT_AUTHOR_NAME}
                    </span>
                    <Link
                      href={`/news/${post.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-[#8B3A2A] group-hover:text-[#D99B26] transition-colors"
                    >
                      Read <span className="hidden sm:inline">story</span> <ArrowRightIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {/* Load More Stories Button */}
        {hasMore && !isSearching && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-ink/20 bg-white px-8 py-3 text-xs font-semibold uppercase tracking-wider text-ink shadow-2xs hover:bg-[#D99B26] hover:text-black hover:border-[#D99B26] transition-all disabled:opacity-50"
            >
              {loadingMore ? 'Loading More Articles...' : 'Load Older Stories'}
            </button>
          </div>
        )}

        {/* Studio Appointment & Wig Consultation CTA Banner */}
        <section className="mt-20 overflow-hidden rounded-3xl bg-black p-8 sm:p-12 text-white relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block">
            <Image
              src="/shop-hero-3.jpg"
              alt=""
              fill
              sizes="33vw"
              className="object-cover"
            />
          </div>
          <div className="relative max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D99B26]">
              Visit Our Salon Studio
            </span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-normal text-white">
              Need Professional Wig Revamping or Custom Installation in Nairobi?
            </h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed font-light">
              Our salon specialists at Mountain Mall, Thika Road provide lace customization,
              knot bleaching, laundry revamping, and glueless installations.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/services"
                className="rounded-full bg-[#D99B26] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-xs hover:bg-[#c88d1f] transition-all"
              >
                Explore Studio Services
              </Link>
              <a
                href={`https://wa.me/${brand.phoneIntl}?text=Hi%20Dallian,%20I%20read%20your%20hair%20guides%20and%20would%20like%20to%20inquire%20about%20a%20wig%20appointment.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:border-[#D99B26] hover:text-[#D99B26] transition-all"
              >
                <MessageCircleIcon className="h-4 w-4 text-[#D99B26]" />
                WhatsApp Consultation
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}