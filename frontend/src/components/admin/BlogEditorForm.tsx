'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  BoldIcon,
  CheckIcon,
  EyeIcon,
  GlobeIcon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Loader2Icon,
  PlusIcon,
  QuoteIcon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon,
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

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description || '');
  const [keywords, setKeywords] = useState(initialPost?.keywords || '');

  // Editor states
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New category modal
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch categories
  useEffect(() => {
    adminFetchBlogCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
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

  // Cover image upload
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      pushToast({ title: 'Please select an image file.', tone: 'error' });
      return;
    }
    try {
      setIsUploadingImage(true);
      const res = await uploadImageToCloudinary(file);
      setCoverImage(res.secureUrl);
      pushToast({
        title: 'Image uploaded to Cloudinary & link autofilled!',
        tone: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      pushToast({ title: msg, tone: 'error' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Inline content image upload
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const res = await uploadImageToCloudinary(file);
      insertMarkdown(`\n![Image description](${res.secureUrl})\n`);
      pushToast({ title: 'Image inserted into article!', tone: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      pushToast({ title: msg, tone: 'error' });
    } finally {
      setIsUploadingImage(false);
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
    } catch {
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ', '', 'Heading 2')}
                  title="Heading 2"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <Heading2Icon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ', '', 'Heading 3')}
                  title="Heading 3"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <Heading3Icon className="h-4 w-4" />
                </button>
                <span className="h-4 w-[1px] bg-ink/15 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**', 'bold text')}
                  title="Bold"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <BoldIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*', 'italic text')}
                  title="Italic"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <ItalicIcon className="h-4 w-4" />
                </button>
                <span className="h-4 w-[1px] bg-ink/15 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ', '', 'Bullet point')}
                  title="Bullet List"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('1. ', '', 'Numbered point')}
                  title="Numbered List"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <ListOrderedIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ', '', 'Quote text')}
                  title="Blockquote"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <QuoteIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[', '](https://dallian.online)', 'Link text')}
                  title="Insert Link"
                  className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>

                {/* Inline Image Upload */}
                <label
                  title="Insert Image into content"
                  className="cursor-pointer rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <ImageIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleContentImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* View Switcher: Write vs Preview */}
              <div className="flex items-center rounded-xl border border-ink/10 bg-cream/50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={cx(
                    'rounded-lg px-3 py-1 font-medium transition-colors',
                    activeTab === 'write' ? 'bg-white shadow-2xs text-ink font-semibold' : 'text-ink/60 hover:text-ink'
                  )}
                >
                  Write Story
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={cx(
                    'rounded-lg px-3 py-1 font-medium transition-colors inline-flex items-center gap-1',
                    activeTab === 'preview' ? 'bg-white shadow-2xs text-ink font-semibold' : 'text-ink/60 hover:text-ink'
                  )}
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  Live Preview
                </button>
              </div>
            </div>

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
          <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-ink/10 pb-3">
              <GlobeIcon className="h-4 w-4 text-[#D99B26]" />
              <h2 className="font-serif text-lg text-ink">Google Search Optimization (SEO)</h2>
            </div>

            {/* Google Result Preview Mockup */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-[11px] uppercase tracking-wider text-neutral-400">Search Snippet Preview</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-neutral-500 font-mono">
                  https://dallian.online &gt; news &gt; {slug || 'your-slug'}
                </p>
                <h3 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                  {metaTitle || title || 'Your Article Title | Dallian Luxe Hair Nairobi'}
                </h3>
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {metaDescription || excerpt || 'Article description will appear here on Google searches, encouraging Kenyan wig lovers to click and read...'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-ink/70">
                  <label htmlFor="meta-title">SEO Page Title</label>
                  <span className={cx((metaTitle || title).length > 60 ? 'text-amber-600' : 'text-ink/40')}>
                    {(metaTitle || title).length}/60
                  </span>
                </div>
                <input
                  id="meta-title"
                  type="text"
                  placeholder={title || 'Leave blank to use article title'}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3.5 py-2 text-xs text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-ink/70">
                  <label htmlFor="target-keywords">Keywords (comma-separated)</label>
                </div>
                <input
                  id="target-keywords"
                  type="text"
                  placeholder="e.g. hd lace, wig care nairobi, human hair"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3.5 py-2 text-xs text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-ink/70">
                <label htmlFor="meta-desc">SEO Meta Description</label>
                <span className={cx((metaDescription || excerpt).length > 160 ? 'text-amber-600' : 'text-ink/40')}>
                  {(metaDescription || excerpt).length}/160 recommended
                </span>
              </div>
              <textarea
                id="meta-desc"
                rows={2}
                placeholder={excerpt || 'Concise description for search crawlers'}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3.5 py-2 text-xs text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Publishing Sidebar Settings */}
        <div className="space-y-6">
          {/* Status & Featured */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="font-serif text-base text-ink border-b border-ink/10 pb-2">Publish Settings</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Publish Status</p>
                <p className="text-[11px] text-ink/50">
                  {isPublished ? 'Visible live on storefront' : 'Saved privately as draft'}
                </p>
              </div>
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
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <div>
                <h3 className="font-serif text-base text-ink">Cover Banner Image</h3>
                <p className="text-[11px] text-ink/50">Upload to Cloudinary or paste an image link directly</p>
              </div>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2Icon className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-cream/40 p-1 text-xs border border-ink/10">
              <button
                type="button"
                onClick={() => setImageInputMode('upload')}
                className={cx(
                  'flex-1 rounded-lg py-1.5 font-medium transition-all text-center inline-flex items-center justify-center gap-1.5',
                  imageInputMode === 'upload'
                    ? 'bg-white shadow-2xs text-ink font-semibold'
                    : 'text-ink/60 hover:text-ink'
                )}
              >
                <UploadCloudIcon className="h-3.5 w-3.5 text-[#D99B26]" />
                Upload File (Cloudinary)
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={cx(
                  'flex-1 rounded-lg py-1.5 font-medium transition-all text-center inline-flex items-center justify-center gap-1.5',
                  imageInputMode === 'url'
                    ? 'bg-white shadow-2xs text-ink font-semibold'
                    : 'text-ink/60 hover:text-ink'
                )}
              >
                <LinkIcon className="h-3.5 w-3.5 text-[#8B3A2A]" />
                Paste Image Link
              </button>
            </div>

            {/* Mode 1: File Upload (Uploads to Cloudinary and autofills URL) */}
            {imageInputMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cx(
                  'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/20 p-5 text-center transition-all cursor-pointer hover:border-[#D99B26] hover:bg-cream/40',
                  isUploadingImage && 'pointer-events-none opacity-60'
                )}
              >
                {isUploadingImage ? (
                  <Loader2Icon className="h-7 w-7 animate-spin text-[#D99B26]" />
                ) : (
                  <UploadCloudIcon className="h-7 w-7 text-ink/40" />
                )}
                <p className="mt-2 text-xs font-semibold text-ink">
                  {isUploadingImage ? 'Uploading & saving to Cloudinary...' : 'Click to select or drop image'}
                </p>
                <p className="mt-0.5 text-[10px] text-ink/50">PNG, JPG, or WEBP up to 5MB (autofills link)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  className="hidden"
                />
              </div>
            )}

            {/* Mode 2: Direct Link Input */}
            {imageInputMode === 'url' && (
              <div>
                <label htmlFor="cover-url-manual" className="block text-[11px] font-medium text-ink/70">
                  Enter image web address (URL):
                </label>
                <input
                  id="cover-url-manual"
                  type="url"
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/15 bg-cream/30 px-3 py-2 text-xs text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Autofilled Image URL Field (Always visible & editable) */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-ink/70">
                <span>Active Image Link (autofilled):</span>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(coverImage);
                      pushToast({ title: 'Image link copied to clipboard!', tone: 'success' });
                    }}
                    className="text-[10px] text-[#8B3A2A] hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Copy Link
                  </button>
                )}
              </div>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="No image uploaded or entered yet"
                className="mt-1 w-full rounded-xl border border-ink/15 bg-cream/20 px-3 py-1.5 font-mono text-[11px] text-ink focus:border-[#D99B26] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Live Preview Display */}
            {coverImage && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-ink/60">Live Image Preview:</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-ink/10 bg-cream/40 shadow-2xs group">
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-[#D99B26] shadow-sm transition-colors"
                    >
                      Replace File
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 shadow-sm transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
      {newCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-serif text-lg text-ink">Add Blog Category</h3>
              <button
                type="button"
                onClick={() => setNewCatOpen(false)}
                className="text-neutral-400 hover:text-ink"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hair Transformations"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3 py-2 text-sm text-ink focus:border-[#D99B26] focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCatOpen(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCat || !newCatName.trim()}
                  className="rounded-xl bg-[#D99B26] px-4 py-2 text-xs font-semibold text-black hover:bg-[#c88d1f] disabled:opacity-50"
                >
                  {creatingCat ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
