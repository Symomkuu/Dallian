'use client';

import React from 'react';
import { XIcon } from 'lucide-react';

interface BlogCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  name: string;
  onChangeName: (val: string) => void;
  isCreating: boolean;
}

export function BlogCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  name,
  onChangeName,
  isCreating,
}: BlogCategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="font-serif text-lg text-ink">Add Blog Category</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Hair Transformations"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-cream/30 px-3 py-2 text-sm text-ink focus:border-[#D99B26] focus:bg-white focus:outline-none"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="rounded-xl bg-[#D99B26] px-4 py-2 text-xs font-semibold text-black hover:bg-[#c88d1f] disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
