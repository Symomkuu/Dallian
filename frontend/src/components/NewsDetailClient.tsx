'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CopyIcon,
  EyeIcon,
  MessageCircleIcon,
  ShoppingBagIcon,
} from 'lucide-react';
import type { BlogPost } from '@/types';
import { cx, formatDate } from '@/utils/format';
import { brand } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { recordBlogPostView } from '@/utils/api';

interface NewsDetailClientProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}

import { ArticleRenderer, parseArticleBlocks } from './ArticleRenderer';

export function NewsDetailClient({ post, relatedPosts }: NewsDetailClientProps) {
  const { pushToast } = useStore();
  const [copied, setCopied] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const { blocks, toc } = useMemo(() => parseArticleBlocks(post.content), [post.content]);
  const activeId = activeHeadingId || (toc[0]?.id ?? '');

  // Record real reader view on mount
  useEffect(() => {
    if (post.slug) {
      recordBlogPostView(post.slug).catch(() => {});
    }
  }, [post.slug]);

  // Synowatt IntersectionObserver scroll-spy with rootMargin: '-110px 0px -65% 0px'
  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          setActiveHeadingId(visible[0].target.id);
        }
      },
      { rootMargin: '-110px 0px -65% 0px' }
    );

    toc.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveHeadingId(id);
  };

  const shareUrl = `https://dallian.online/news/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopyLink = async () => {
    try {
      const urlToCopy = typeof window !== 'undefined' ? window.location.href : shareUrl;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      pushToast({ title: 'Article link copied to clipboard!', tone: 'success' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      pushToast({ title: 'Unable to copy link.', tone: 'error' });
    }
  };

  const displayRelated =
    (relatedPosts && relatedPosts.length > 0 ? relatedPosts : post.related_posts) || [];

  return (
    <article className="min-h-screen bg-[#FAF8F5]">
      {/* ── 1. Top Dark Hero Banner (Synowatt style with Dallian Luxury Colors) ── */}
      <section className="relative overflow-hidden bg-[#0A0A0A] pb-16 pt-10 sm:pb-24 sm:pt-14 text-white">
        {/* Subtle Luxury Gold Radial Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#D99B26]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <Link href="/news" className="hover:text-white transition-colors">
              Blog
            </Link>
            {post.category && (
              <>
                <span>&gt;</span>
                <span className="text-[#D99B26] font-medium truncate max-w-[200px]">
                  {post.category.name}
                </span>
              </>
            )}
          </nav>

          {/* Headline */}
          <h1 className="mt-6 font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.15]">
            {post.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {post.excerpt && (
            <p className="mt-4 max-w-3xl text-base sm:text-lg text-white/75 font-light leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author Byline Bar */}
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-white/10 pt-5 text-xs text-white/70">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#D99B26]/60 bg-white p-0.5">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="leading-tight">
                <p className="font-semibold text-white">
                  {post.author_name || 'Dallian Luxe Editorial Team'}
                </p>
                <p className="text-[11px] text-white/50">{brand.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/60">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-[#D99B26]" />
                {post.published_at
                  ? formatDate(post.published_at)
                  : formatDate(post.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-[#D99B26]" />
                {post.read_time_minutes} min read
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <EyeIcon className="h-3.5 w-3.5 text-[#D99B26]" />
                {post.views_count.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Featured Cover Image (Flexible to any image dimension) ── */}
      {post.cover_image && (
        <div className="relative -mt-10 sm:-mt-16 z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-neutral-950 shadow-2xl flex items-center justify-center">
            {/* Ambient luxury blurred background glow matching the image */}
            <div
              className="absolute inset-0 scale-110 opacity-30 blur-2xl pointer-events-none"
              style={{
                backgroundImage: `url(${post.cover_image})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            />
            {/* Naturally scaled image in true proportions without cropping */}
            <Image
              src={post.cover_image}
              alt={post.title}
              width={1200}
              height={800}
              className="relative z-10 mx-auto max-h-[500px] sm:max-h-[560px] w-auto max-w-full object-contain"
              priority
              unoptimized
            />
          </div>
        </div>
      )}

      {/* ── 3. 2-Column Editorial Reading Layout (Synowatt exact layout with Dallian Colors) ── */}
      <section className="bg-white pb-14 pt-10 lg:pb-20 lg:pt-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:px-8 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] md:gap-12 lg:gap-14">
          <aside className="hidden md:block md:border-r md:border-ink/8 md:pr-8 lg:pr-10">
            <div className="sticky top-24 space-y-5">
              {/* 1. Table of Contents */}
              {toc.length > 0 && (
                <nav aria-label="Table of contents">
                  <p className="mb-2.5 font-serif text-xs font-bold uppercase tracking-wider text-ink/70">
                    In this article
                  </p>
                  <ol className="space-y-0.5 border-l border-ink/10">
                    {toc.map((s) => {
                      const isActive = activeId === s.id;
                      return (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            onClick={(e) => scrollToSection(e, s.id)}
                            aria-current={isActive ? 'location' : undefined}
                            className={cx(
                              '-ml-px block border-l-2 py-1 pl-3 text-xs leading-snug transition-colors duration-150',
                              isActive
                                ? 'border-[#8B3A2A] font-semibold text-[#8B3A2A]'
                                : 'border-transparent text-ink/60 hover:text-ink',
                              s.level === 3 ? 'pl-5 text-[11px]' : ''
                            )}
                          >
                            {s.text}
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              )}

              {/* 2. Share Links */}
              <div>
                <p className="mb-2 font-serif text-xs font-bold uppercase tracking-wider text-ink/70">
                  Share this article
                </p>
                <ul className="flex items-center gap-1.5">
                  <li>
                    <a
                      href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodedUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Share on WhatsApp"
                      className="grid h-8 w-8 place-items-center rounded-full bg-[#FAF8F5] border border-ink/10 text-ink/70 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
                    >
                      <MessageCircleIcon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Share on Facebook"
                      className="grid h-8 w-8 place-items-center rounded-full bg-[#FAF8F5] border border-ink/10 text-ink/70 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]"
                    >
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodedUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Share on X"
                      className="grid h-8 w-8 place-items-center rounded-full bg-[#FAF8F5] border border-ink/10 text-ink/70 transition-all duration-150 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:border-black"
                    >
                      <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      aria-label={copied ? 'Link copied' : 'Copy link'}
                      className="grid h-8 w-8 place-items-center rounded-full bg-[#FAF8F5] border border-ink/10 text-ink/70 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#8B3A2A] hover:text-white hover:border-[#8B3A2A]"
                    >
                      {copied ? <CheckIcon className="h-3.5 w-3.5 text-[#8B3A2A]" /> : <CopyIcon className="h-3.5 w-3.5" />}
                    </button>
                  </li>
                </ul>
              </div>

              {/* 3. Written By Author Box */}
              <div className="rounded-xl bg-[#FAF8F5] border border-ink/10 p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#D99B26]/60 bg-white p-0.5">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-ink/50 font-bold">Written by</p>
                    <p className="font-serif text-xs font-semibold text-ink leading-tight">
                      {post.author_name || 'Dallian Luxe Studio'}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-ink/70 leading-relaxed font-light">
                  Hair rituals & styling guidance from Dallian Luxe Studio in Nairobi.
                </p>
              </div>

              {/* 4. Luxury Salon Consultation CTA Box */}
              <div className="rounded-2xl bg-[#0A0A0A] p-4 text-white shadow-card border border-white/10">
                <h4 className="font-serif text-sm font-medium leading-snug">
                  Have questions about our wigs or services?
                </h4>
                <p className="mt-1.5 text-[11px] text-white/70 leading-relaxed font-light">
                  Talk to our stylists about custom unit plucking, styling, or revamping.
                </p>
                <div className="mt-3.5 flex flex-col gap-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#D99B26] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-black shadow-xs hover:bg-[#c88d1f] transition-all"
                  >
                    <ShoppingBagIcon className="h-3 w-3" />
                    Shop Luxury Wigs
                  </Link>
                  <a
                    href={`https://wa.me/${brand.phoneIntl}?text=Hi%20Dallian,%20I%20read%20your%20article%20'${encodeURIComponent(post.title)}'%20and%20would%20like%20to%20inquire.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white hover:border-[#D99B26] hover:bg-white/15 transition-all"
                  >
                    <MessageCircleIcon className="h-3 w-3 text-[#D99B26]" />
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Article Text & Callouts */}
          <article className="min-w-0 max-w-[760px]">
            {/* Mobile Collapsible TOC */}
            {toc.length > 0 && (
              <div className="mb-10 md:hidden">
                <details className="group rounded-2xl bg-[#FAF8F5] border border-ink/10 p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-serif font-bold text-ink [&::-webkit-details-marker]:hidden">
                    In this article
                    <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 group-open:rotate-180 text-ink/60" aria-hidden />
                  </summary>
                  <nav aria-label="Table of contents" className="mt-4">
                    <ol className="space-y-1 border-l border-ink/10">
                      {toc.map((s) => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            onClick={(e) => scrollToSection(e, s.id)}
                            className={cx(
                              '-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug',
                              activeId === s.id
                                ? 'border-[#8B3A2A] font-semibold text-[#8B3A2A]'
                                : 'border-transparent text-ink/60 hover:text-ink',
                              s.level === 3 ? 'pl-7 text-xs' : ''
                            )}
                          >
                            {s.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </details>
              </div>
            )}

            {/* Markdown rendered body */}
            <div className="prose prose-neutral max-w-none text-ink font-sans">
              <ArticleRenderer blocks={blocks} />
            </div>

            {/* Mobile-only Fallbacks (for screens < 768px where sidebar is hidden) */}
            <div className="md:hidden mt-12 space-y-6">
              {/* Mobile Share Links */}
              <div className="border-t border-ink/10 pt-6">
                <p className="mb-3 font-serif text-sm font-bold text-ink">Share this article</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-ink hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all"
                  >
                    <MessageCircleIcon className="h-4 w-4" /> WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-ink hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-ink hover:bg-black hover:text-white hover:border-black transition-all"
                  >
                    X
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-ink hover:bg-[#8B3A2A] hover:text-white hover:border-[#8B3A2A] transition-all"
                  >
                    {copied ? <CheckIcon className="h-4 w-4 text-[#8B3A2A]" /> : <CopyIcon className="h-4 w-4" />}
                    {copied ? 'Link Copied' : 'Copy link'}
                  </button>
                </div>
              </div>

              {/* Mobile Author Card */}
              <div className="flex gap-4 rounded-2xl bg-[#FAF8F5] border border-ink/10 p-5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#D99B26]/60 bg-white p-0.5">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink/50 font-medium">Written by</p>
                  <p className="font-serif text-base font-medium text-ink">{post.author_name || 'Dallian Luxe Studio'}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/70 font-light">
                    Practical hair care rituals and styling guidance from the stylists at Dallian Luxe Hair Studio in Nairobi.
                  </p>
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="rounded-3xl bg-[#0A0A0A] p-6 text-white shadow-card border border-white/10">
                <h3 className="font-serif text-xl font-normal leading-tight">
                  Have questions about our wigs or salon services?
                </h3>
                <p className="mt-2 text-xs text-white/80 leading-relaxed font-light">
                  Talk to Dallian Luxe Hair Studio about custom unit plucking, styling, or revamping needs.
                </p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D99B26] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-xs hover:bg-[#c88d1f] transition-all"
                  >
                    <ShoppingBagIcon className="h-4 w-4" />
                    Shop Luxury Wigs
                  </Link>
                  <a
                    href={`https://wa.me/${brand.phoneIntl}?text=Hi%20Dallian,%20I%20read%20your%20article%20'${encodeURIComponent(post.title)}'%20and%20would%20like%20to%20inquire.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:border-[#D99B26] hover:bg-white/15 transition-all"
                  >
                    <MessageCircleIcon className="h-4 w-4 text-[#D99B26]" />
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── 4. Related Articles Section (Matching Synowatt Layout with Dallian Luxury Colors) ── */}
      {displayRelated.length > 0 && (
        <section className="border-t border-ink/10 bg-[#F5F2EB] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-[#8B3A2A] uppercase">
                  Keep Reading & Learning
                </p>
                <h2 className="mt-1 font-serif text-2xl sm:text-4xl text-ink font-normal">
                  Related Articles
                </h2>
              </div>
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white px-5 py-2.5 text-xs font-semibold text-ink shadow-2xs hover:border-[#D99B26] hover:text-[#8B3A2A] transition-all"
              >
                View All Articles <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {displayRelated.slice(0, 4).map((rel) => (
                <article
                  key={rel.id}
                  className="group flex flex-col overflow-hidden rounded-xl sm:rounded-3xl border border-ink/10 bg-white shadow-xs hover:-translate-y-1 hover:shadow-card transition-all duration-300"
                >
                  <Link
                    href={`/news/${rel.slug}`}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900"
                  >
                    <Image
                      src={rel.cover_image || '/shop-hero.jpg'}
                      alt={rel.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    {rel.category && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-white/95 backdrop-blur-xs px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8B3A2A] shadow-xs">
                        {rel.category.name}
                      </span>
                    )}
                  </Link>

                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-ink/50">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#D99B26]" />
                          {rel.read_time_minutes} min read
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          {rel.published_at ? formatDate(rel.published_at) : formatDate(rel.created_at)}
                        </span>
                      </div>

                      <Link href={`/news/${rel.slug}`}>
                        <h4 className="mt-1 sm:mt-2.5 font-serif text-xs sm:text-base text-ink font-medium group-hover:text-[#8B3A2A] transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                      </Link>

                      <p className="mt-1.5 text-xs text-ink/65 line-clamp-2 leading-relaxed font-light hidden sm:block">
                        {rel.excerpt}
                      </p>
                    </div>

                    <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-ink/5">
                      <Link
                        href={`/news/${rel.slug}`}
                        className="text-[10px] sm:text-xs font-semibold text-[#8B3A2A] inline-flex items-center gap-1 group-hover:text-[#D99B26] transition-colors"
                      >
                        Read <span className="hidden sm:inline">guide</span> <ArrowRightIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
