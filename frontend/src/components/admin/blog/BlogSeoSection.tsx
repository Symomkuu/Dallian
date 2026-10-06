'use client';

import React from 'react';
import { GlobeIcon } from 'lucide-react';
import { cx } from '@/utils/format';

interface BlogSeoSectionProps {
  title: string;
  excerpt: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  onMetaTitleChange: (val: string) => void;
  onMetaDescriptionChange: (val: string) => void;
  onKeywordsChange: (val: string) => void;
}

export function BlogSeoSection({
  title,
  excerpt,
  slug,
  metaTitle,
  metaDescription,
  keywords,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onKeywordsChange,
}: BlogSeoSectionProps) {
  const displayTitle = metaTitle || title || 'Your Article Title | Dallian Luxe Hair Nairobi';
  const displayDesc =
    metaDescription ||
    excerpt ||
    'Article description will appear here on Google searches, encouraging Kenyan wig lovers to click and read...';

  return (
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
            {displayTitle}
          </h3>
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {displayDesc}
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
            onChange={(e) => onMetaTitleChange(e.target.value)}
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
            onChange={(e) => onKeywordsChange(e.target.value)}
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
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3.5 py-2 text-xs text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none"
        />
      </div>
    </div>
  );
}
