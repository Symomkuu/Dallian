'use client';

import React from 'react';
import {
  BoldIcon,
  EyeIcon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
} from 'lucide-react';
import { cx } from '@/utils/format';

interface BlogMarkdownToolbarProps {
  onInsert: (before: string, after?: string, defaultText?: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: 'write' | 'preview';
  onTabChange: (tab: 'write' | 'preview') => void;
}

export function BlogMarkdownToolbar({
  onInsert,
  onImageUpload,
  activeTab,
  onTabChange,
}: BlogMarkdownToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3">
      {/* Markdown Quick Insert Buttons */}
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onInsert('## ', '', 'Heading 2')}
          title="Heading 2"
          className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <Heading2Icon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('### ', '', 'Heading 3')}
          title="Heading 3"
          className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <Heading3Icon className="h-4 w-4" />
        </button>
        <span className="h-4 w-[1px] bg-ink/15 mx-1" />
        <button
          type="button"
          onClick={() => onInsert('**', '**', 'bold text')}
          title="Bold"
          className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('*', '*', 'italic text')}
          title="Italic"
          className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <span className="h-4 w-[1px] bg-ink/15 mx-1" />
        <button
          type="button"
          onClick={() => onInsert('- ', '', 'Bullet point')}
          title="Bullet List"
          className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <ListIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('1. ', '', 'Numbered point')}
          title="Numbered List"
          className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <ListOrderedIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('> ', '', 'Quote text')}
          title="Blockquote"
          className="rounded-lg p-2 text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        >
          <QuoteIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('[', '](https://dallian.online)', 'Link text')}
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
            onChange={onImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* View Switcher: Write vs Preview */}
      <div className="flex items-center rounded-xl border border-ink/10 bg-cream/50 p-1 text-xs">
        <button
          type="button"
          onClick={() => onTabChange('write')}
          className={cx(
            'rounded-lg px-3 py-1 font-medium transition-colors',
            activeTab === 'write' ? 'bg-white shadow-2xs text-ink font-semibold' : 'text-ink/60 hover:text-ink'
          )}
        >
          Write Story
        </button>
        <button
          type="button"
          onClick={() => onTabChange('preview')}
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
  );
}
