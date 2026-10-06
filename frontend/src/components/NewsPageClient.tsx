'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ClockIcon,
  MessageCircleIcon,
  SearchIcon,
} from 'lucide-react';
import type { BlogCategory, BlogPost } from '@/types';
import { cx, formatDate } from '@/utils/format';
import { brand } from '@/data/brand';

interface NewsPageClientProps {
  initialPosts: BlogPost[];
  categories: BlogCategory[];
}

export function NewsPageClient({ initialPosts, categories }: NewsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Strictly sort posts by newest first (published_at or created_at)
  const sortedPosts = useMemo(() => {
    return [...initialPosts].sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return timeB - timeA;
    });
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    return sortedPosts.filter((post) => {
      const matchCat =
        selectedCategory === 'all' || post.category?.slug === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [sortedPosts, selectedCategory, searchQuery]);

  // Featured hero article (the single featured post, or the newest post)
  const featuredPost = useMemo(() => {
    return sortedPosts.find((p) => p.is_featured) || sortedPosts[0];
  }, [sortedPosts]);

  // Grid posts: excluding featured if no search/filter active, strictly newest first
  const gridPosts = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== 'all') {
      return filteredPosts;
    }
    return filteredPosts.filter((p) => p.id !== featuredPost?.id);
  }, [filteredPosts, featuredPost, searchQuery, selectedCategory]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-black py-16 sm:py-24 text-white">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="/shop-hero.jpg"
            alt="Dallian Luxe Hair Studio"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative mx-auto max-w-page px-4 sm:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D99B26]">
            The Dallian Journal
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal">
            Latest News &amp; Hair Guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/70 leading-relaxed font-light">
            Expert care rituals, luxury virgin hair trends, and studio secrets straight
            from Nairobi&apos;s premier wig artisans.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-page px-4 py-10 sm:px-8 sm:py-16">
        {/* Featured Story Hero (when browsing all without query) */}
        {!searchQuery && selectedCategory === 'all' && featuredPost && (
          <div className="mb-14">
            <div className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card transition-all duration-300 hover:shadow-lg">
              <div className="grid lg:grid-cols-12 items-stretch">
                <div className="relative min-h-[280px] lg:min-h-[420px] lg:col-span-7 overflow-hidden bg-neutral-900">
                  <Image
                    src={featuredPost.cover_image || '/shop-hero.jpg'}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 inline-flex items-center rounded-full bg-[#D99B26] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-black shadow-sm">
                    Featured Story
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-5">
                  <div>
                    {featuredPost.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8B3A2A]">
                        {featuredPost.category.name}
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
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={cx(
                'whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
                selectedCategory === 'all'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-ink/70 border border-ink/10 hover:border-ink/30 hover:text-ink'
              )}
            >
              All Stories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={cx(
                  'whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
                  selectedCategory === cat.slug
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-ink/70 border border-ink/10 hover:border-ink/30 hover:text-ink'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              placeholder="Search guides & news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 py-2 text-xs text-ink placeholder:text-ink/40 shadow-2xs focus:border-[#D99B26] focus:outline-none focus:ring-1 focus:ring-[#D99B26]"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {gridPosts.length === 0 ? (
          <div className="rounded-3xl border border-ink/10 bg-white p-12 text-center shadow-card">
            <BookOpenIcon className="mx-auto h-12 w-12 text-ink/20" />
            <h3 className="mt-4 font-serif text-xl text-ink">No articles match your search</h3>
            <p className="mt-2 text-sm text-ink/60">
              Try adjusting your search terms or category filter to find other guides.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-5 rounded-full bg-[#D99B26] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black shadow-xs hover:bg-[#c88d1f]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {post.category && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-white/95 px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8B3A2A] shadow-xs backdrop-blur">
                      {post.category.name}
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
                      By {post.author_name}
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
        )}

        {/* Studio Appointment & Wig Consultation CTA Banner */}
        <section className="mt-20 overflow-hidden rounded-3xl bg-black p-8 sm:p-12 text-white relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block">
            <Image
              src="/shop-hero-3.jpg"
              alt="Dallian Luxe Hair Salon"
              fill
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
