'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ClockIcon,
  EditIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react';
import type { BlogPost, BlogStats } from '@/types';
import { adminDeleteBlogPost, adminFetchBlogPosts, adminFetchBlogStats } from '@/utils/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatDate } from '@/utils/format';

export default function AdminBlogsPage() {
  const { pushToast } = useStore();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BlogStats | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const pageSize = 20;

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const [res, statsRes] = await Promise.allSettled([
        adminFetchBlogPosts({
          status: statusFilter,
          search: search.trim() || undefined,
          page,
          page_size: pageSize,
        }),
        adminFetchBlogStats(),
      ]);

      if (res.status === 'fulfilled') {
        setPosts(res.value.results || []);
        setTotalCount(res.value.count || 0);
      } else {
        pushToast({ title: 'Failed to load blog posts.', tone: 'error' });
        setPosts([]);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch {
      pushToast({ title: 'Failed to load blog posts.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, pushToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadPosts]);

  const handleStatusFilterChange = (newStatus: 'all' | 'published' | 'draft') => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setDeletingId(id);
      await adminDeleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      adminFetchBlogStats().then(setStats).catch(() => {});
      pushToast({ title: 'Article deleted.', tone: 'info' });
    } catch {
      pushToast({ title: 'Failed to delete article.', tone: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const totalStories = stats?.total ?? totalCount;
  const publishedCount = stats?.published ?? posts.filter((p) => p.is_published).length;
  const draftCount = stats?.draft ?? posts.filter((p) => !p.is_published).length;
  const totalViews = stats?.total_views ?? posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      <AdminPageHeader
        title="Articles & News"
        body="Create, optimize, and publish high-ranking hair care and styling stories to attract organic visitors and convert them into customers."
        actions={
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#D99B26] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-xs transition-all hover:bg-[#c88d1f]"
          >
            <PlusIcon className="h-4 w-4" />
            Write New Article
          </Link>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">Total Stories</p>
          <p className="mt-1 font-serif text-2xl text-ink">{totalStories}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Published</p>
          <p className="mt-1 font-serif text-2xl text-emerald-700">{publishedCount}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Drafts</p>
          <p className="mt-1 font-serif text-2xl text-amber-700">{draftCount}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">Total Views</p>
          <p className="mt-1 font-serif text-2xl text-ink">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center rounded-xl bg-cream/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => handleStatusFilterChange('all')}
            className={cx(
              'rounded-lg px-3 py-1.5 font-medium transition-colors',
              statusFilter === 'all'
                ? 'bg-white text-ink shadow-2xs font-semibold'
                : 'text-ink/60 hover:text-ink'
            )}
          >
            All Articles
          </button>
          <button
            type="button"
            onClick={() => handleStatusFilterChange('published')}
            className={cx(
              'rounded-lg px-3 py-1.5 font-medium transition-colors',
              statusFilter === 'published'
                ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                : 'text-ink/60 hover:text-ink'
            )}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => handleStatusFilterChange('draft')}
            className={cx(
              'rounded-lg px-3 py-1.5 font-medium transition-colors',
              statusFilter === 'draft'
                ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                : 'text-ink/60 hover:text-ink'
            )}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search articles by title or keyword..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-cream/30 pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink/40 focus:border-[#D99B26] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-sm text-ink/50">Loading articles...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpenIcon className="mx-auto h-10 w-10 text-ink/20" />
            <h3 className="mt-3 font-serif text-lg text-ink">No articles found</h3>
            <p className="mt-1 text-xs text-ink/60">
              {search
                ? 'Try a different search term.'
                : 'Ready to write your first beauty guide or store news?'}
            </p>
            <Link
              href="/admin/blogs/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#D99B26] px-4 py-2 text-xs font-semibold text-black shadow-xs hover:bg-[#c88d1f]"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Write First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink/10 bg-cream/40 text-[11px] font-semibold uppercase tracking-wider text-ink/60">
                <tr>
                  <th className="py-3.5 pl-5 pr-3">Article</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5 text-right">Views</th>
                  <th className="px-3 py-3.5">Date</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-cream/20 transition-colors">
                    {/* Article Info with Image */}
                    <td className="py-3.5 pl-5 pr-3 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-cream/40">
                          {post.cover_image ? (
                            <Image
                              src={post.cover_image}
                              alt={post.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink/20">
                              <FileTextIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {post.is_featured && (
                              <span className="inline-flex items-center rounded-md bg-[#D99B26]/15 px-2 py-0.5 text-[9px] font-bold uppercase text-[#8B3A2A]">
                                Featured
                              </span>
                            )}
                            <Link
                              href={`/admin/blogs/${post.id}/edit`}
                              className="font-medium text-ink hover:text-[#8B3A2A] transition-colors truncate block"
                            >
                              {post.title}
                            </Link>
                          </div>
                          <p className="mt-0.5 text-[11px] text-ink/40 font-mono truncate">
                            /{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {(() => {
                        const catName =
                          post.category_details?.name ||
                          (typeof post.category === 'object' && post.category ? post.category.name : null);
                        return catName ? (
                          <span className="rounded-full bg-cream/90 px-2.5 py-1 text-[11px] font-medium text-ink/70 border border-ink/10">
                            {catName}
                          </span>
                        ) : (
                          <span className="text-ink/30 italic">Uncategorized</span>
                        );
                      })()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {post.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                          <CheckCircle2Icon className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 border border-amber-200">
                          <ClockIcon className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </td>

                    {/* Views Count */}
                    <td className="px-3 py-3.5 text-right font-medium text-ink/70 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <EyeIcon className="h-3 w-3 text-ink/40" />
                        {post.views_count.toLocaleString()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3.5 text-ink/50 whitespace-nowrap">
                      {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.is_published && (
                          <Link
                            href={`/news/${post.slug}`}
                            target="_blank"
                            title="View live page on site"
                            className="rounded-lg p-1.5 text-ink/50 hover:bg-cream hover:text-ink transition-colors"
                          >
                            <ExternalLinkIcon className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blogs/${post.id}/edit`}
                          title="Edit article"
                          className="rounded-lg p-1.5 text-ink/70 hover:bg-cream hover:text-[#8B3A2A] transition-colors"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deletingId === post.id}
                          title="Delete article"
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalCount > pageSize && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-white px-5 py-3.5 text-xs text-ink/70">
                <div>
                  Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to{' '}
                  {Math.min(page * pageSize, totalCount)} of {totalCount} articles
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-ink/10 bg-cream/30 px-3 py-1.5 font-medium hover:bg-cream disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono text-[11px]">
                    Page {page} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                    disabled={page >= Math.ceil(totalCount / pageSize)}
                    className="rounded-lg border border-ink/10 bg-cream/30 px-3 py-1.5 font-medium hover:bg-cream disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
