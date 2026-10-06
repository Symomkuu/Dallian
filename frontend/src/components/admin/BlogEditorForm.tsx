'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckIcon,
  Loader2Icon,
  PlusIcon,
} from 'lucide-react';
import type { BlogCategory, BlogPost } from '@/types';
import {
  adminCreateBlogCategory,
  adminCreateBlogPost,
  adminFetchBlogCategories,
  adminUpdateBlogPost,
} from '@/utils/api';
import { uploadImageToCloudinary } from '@/utils/cloudinary';
import { useStore } from '@/contexts/StoreContext';
import { cx } from '@/utils/format';
import { ArticleRenderer } from '@/components/ArticleRenderer';
import { BlogMarkdownToolbar } from './blog/BlogMarkdownToolbar';
import { BlogSeoSection } from './blog/BlogSeoSection';
import { BlogCoverImageUpload } from './blog/BlogCoverImageUpload';
import { BlogCategoryModal } from './blog/BlogCategoryModal';

interface BlogEditorFormProps {
  initialPost?: BlogPost;
  isEdit?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function BlogEditorForm({ initialPost, isEdit = false }: BlogEditorFormProps) {
  const router = useRouter();
  const { pushToast } = useStore();

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Fields
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [manualSlug, setManualSlug] = useState(!!initialPost?.slug);
  const [categoryId, setCategoryId] = useState<number | ''>(() => {
    if (initialPost?.category_details?.id) return initialPost.category_details.id;
    if (typeof initialPost?.category === 'number') return initialPost.category;
    if (typeof initialPost?.category === 'object' && initialPost?.category?.id) return initialPost.category.id;
    if (initialPost?.category_id) return initialPost.category_id;
    return '';
  });
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || '');
  const [tags, setTags] = useState(initialPost?.tags || '');
  const [authorName, setAuthorName] = useState(initialPost?.author_name || 'Dallian Luxe Studio');
  const [isPublished, setIsPublished] = useState(initialPost?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(initialPost?.is_featured ?? false);

  // SEO Fields: if meta_title/meta_description matched title/excerpt, treat as non-overridden (blank)
  // so the placeholder shows the current title/excerpt and renaming dynamically updates SEO tags.
  const [metaTitle, setMetaTitle] = useState(() => {
    if (!initialPost?.meta_title) return '';
    return initialPost.meta_title.trim() === initialPost.title?.trim() ? '' : initialPost.meta_title;
  });
  const [metaDescription, setMetaDescription] = useState(() => {
    if (!initialPost?.meta_description) return '';
    const initialExcerpt160 = (initialPost.excerpt || '').trim().slice(0, 160);
    return initialPost.meta_description.trim() === initialExcerpt160 ? '' : initialPost.meta_description;
  });
  const [keywords, setKeywords] = useState(initialPost?.keywords || '');

  // Editor states
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New category modal
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch categories
  useEffect(() => {
    adminFetchBlogCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to load blog categories:', err);
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  // Auto-slugify when title changes (unless manualSlug is toggled)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!manualSlug) {
      setSlug(slugify(val));
    }
  };

  // Word count & read time
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  // Quick insert markdown helper
  const insertMarkdown = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = contentInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // Inline content image upload
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImageToCloudinary(file);
      insertMarkdown(`\n![Image description](${res.secureUrl})\n`);
      pushToast({ title: 'Image inserted into article!', tone: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      pushToast({ title: msg, tone: 'error' });
    } finally {
      e.target.value = '';
    }
  };

  // Quick create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const created = await adminCreateBlogCategory({ name: newCatName.trim() });
      setCategories((prev) => [...prev, created]);
      setCategoryId(created.id);
      setNewCatName('');
      setNewCatOpen(false);
      pushToast({ title: `Category "${created.name}" created!`, tone: 'success' });
    } catch (err) {
      console.error('Failed to create category:', err);
      pushToast({ title: 'Failed to create category.', tone: 'error' });
    } finally {
      setCreatingCat(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (publishState: boolean) => {
    if (!title.trim()) {
      pushToast({ title: 'Please enter a title for the article.', tone: 'error' });
      return;
    }
    if (!content.trim()) {
      pushToast({ title: 'Please add some content to the article.', tone: 'error' });
      return;
    }

    setIsSubmitting(true);
    setIsPublished(publishState);
    const catNum = categoryId ? Number(categoryId) : null;
    const payload: Partial<BlogPost> = {
      title: title.trim(),
      slug: (slug.trim() || slugify(title)).slice(0, 190),
      excerpt: excerpt.trim(),
      content: content.trim(),
      cover_image: coverImage.trim(),
      category: catNum,
      category_id: catNum,
      tags: tags.trim(),
      author_name: authorName.trim() || 'Dallian Luxe Studio',
      is_published: publishState,
      is_featured: publishState ? isFeatured : false,
      read_time_minutes: readTime,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDescription.trim() || excerpt.trim().slice(0, 160),
      keywords: keywords.trim(),
    };

    try {
      if (isEdit && initialPost) {
        await adminUpdateBlogPost(initialPost.id, payload);
        pushToast({
          title: publishState ? 'Article published successfully!' : 'Draft updated successfully!',
          tone: 'success',
        });
      } else {
        await adminCreateBlogPost(payload);
        pushToast({
          title: publishState ? 'Article created and published!' : 'Draft saved successfully!',
          tone: 'success',
        });
      }
      router.push('/admin/blogs');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save article';
      pushToast({ title: msg, tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-cream/95 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/blogs')}
            className="text-xs font-semibold uppercase tracking-wider text-ink/60 hover:text-ink transition-colors"
          >
            ← Back to Articles
          </button>
          <span className="text-ink/20">|</span>
          <span className="text-xs text-ink/50">
            {wordCount} words • ~{readTime} min read
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="rounded-xl border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink shadow-2xs hover:bg-ink/5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit && isPublished ? 'Revert to Draft' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D99B26] bg-[#D99B26] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black shadow-xs hover:bg-[#c88d1f] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <CheckIcon className="h-4 w-4" />
            )}
            {isEdit && isPublished ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Left Column: Core Content Writing */}
        <div className="space-y-6">
          {/* Title & Slug */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div>
              <label htmlFor="blog-title" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                id="blog-title"
                type="text"
                placeholder="e.g. 5 Pro Secrets to Caring for HD Lace Wigs in Nairobi"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-4 py-3 font-serif text-lg text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D99B26]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink/60">Permalink URL Slug:</span>
                <button
                  type="button"
                  onClick={() => setManualSlug(!manualSlug)}
                  className="text-xs text-[#8B3A2A] hover:underline"
                >
                  {manualSlug ? 'Auto-generate from title' : 'Customize slug'}
                </button>
              </div>
              <div className="mt-1 flex items-center rounded-xl border border-ink/15 bg-cream/40 px-3 py-2 text-xs text-ink/70">
                <span className="text-ink/40">dallian.online/news/</span>
                <input
                  type="text"
                  value={slug}
                  disabled={!manualSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent px-1 font-mono text-ink focus:outline-none disabled:text-ink/60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="blog-excerpt" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                Short Excerpt / Preview Summary
              </label>
              <textarea
                id="blog-excerpt"
                rows={2}
                placeholder="A compelling 1-2 sentence hook shown on listing cards, search results, and social previews..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D99B26]"
              />
            </div>
          </div>

          {/* Content Writing Area with Toolbar & Markdown / Preview Tabs */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-2xs">
            <BlogMarkdownToolbar
              onInsert={insertMarkdown}
              onImageUpload={handleContentImageUpload}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Editor vs Preview Content */}
            <div className="mt-4">
              {activeTab === 'write' ? (
                <div>
                  <textarea
                    ref={contentInputRef}
                    rows={16}
                    placeholder="Write your article here... You can use headings, lists, quotes, and links to craft helpful beauty and wig care tips."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full resize-y rounded-xl border border-ink/10 bg-cream/20 p-4 font-mono text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D99B26]"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink/50">
                    <span>Supports Markdown formatting (## headings, **bold**, - lists, &gt; quotes).</span>
                    <span>{wordCount} words</span>
                  </div>
                </div>
              ) : (
                <div className="min-h-[380px] rounded-xl border border-ink/10 bg-[#FDFBF7] p-6 text-sm">
                  <ArticleRenderer content={content} />
                </div>
              )}
            </div>
          </div>

          {/* Google SEO Snippet Preview & Metadata Settings */}
          <BlogSeoSection
            title={title}
            excerpt={excerpt}
            slug={slug}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            keywords={keywords}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
            onKeywordsChange={setKeywords}
          />
        </div>

        {/* Right Sidebar: Publishing Settings, Image, Category */}
        <div className="space-y-6">
          {/* Status & Featured Box */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="font-serif text-base text-ink border-b border-ink/10 pb-2">Publish Settings</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Publish Status</p>
                <p className="text-[11px] text-ink/50">Save as draft or publish to live site</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={cx(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  isPublished ? 'bg-emerald-600' : 'bg-neutral-300'
                )}
              >
                <span
                  className={cx(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-ink/70">
              <span>Current Status:</span>
              <span
                className={cx(
                  'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border',
                  isPublished
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                )}
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-ink/10 pt-3">
              <div>
                <p className="text-xs font-semibold text-ink">Featured Headline</p>
                <p className="text-[11px] text-ink/50">Highlight as top hero story (published only)</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={cx(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  isFeatured ? 'bg-[#D99B26]' : 'bg-neutral-300'
                )}
              >
                <span
                  className={cx(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="border-t border-ink/10 pt-3">
              <label htmlFor="author-name" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                Author Byline
              </label>
              <input
                id="author-name"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3 py-2 text-xs text-ink focus:border-[#D99B26] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Cover Banner Image Section */}
          <BlogCoverImageUpload
            coverImage={coverImage}
            onCoverImageChange={setCoverImage}
          />

          {/* Category Selector */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <h3 className="font-serif text-base text-ink">Category</h3>
              <button
                type="button"
                onClick={() => setNewCatOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B3A2A] hover:underline"
              >
                <PlusIcon className="h-3 w-3" /> New
              </button>
            </div>

            <select
              value={categoryId}
              disabled={loadingCategories}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl border border-ink/15 bg-cream/30 px-3.5 py-2.5 text-xs text-ink focus:border-[#D99B26] focus:bg-white focus:outline-none disabled:opacity-50"
            >
              <option value="">{loadingCategories ? 'Loading categories...' : 'Select a category...'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div>
              <label htmlFor="tags-input" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                Tags
              </label>
              <input
                id="tags-input"
                type="text"
                placeholder="e.g. wig care, lace frontal, styling"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3 py-2 text-xs text-ink focus:border-[#D99B26] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Category Modal */}
      <BlogCategoryModal
        isOpen={newCatOpen}
        onClose={() => setNewCatOpen(false)}
        onSubmit={handleCreateCategory}
        name={newCatName}
        onChangeName={setNewCatName}
        isCreating={creatingCat}
      />
    </div>
  );
}
