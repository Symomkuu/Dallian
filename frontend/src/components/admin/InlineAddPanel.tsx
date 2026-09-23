'use client';

import React, { useState } from 'react';
import { cx } from '@/utils/format';

interface InlineAddPanelProps {
  /** e.g. "Category" or "Hairstyle" — used in the label and error text */
  label: string;
  placeholder?: string;
  isCreating: boolean;
  onConfirm: (name: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * Inline creation panel that slides in below a select when the user picks
 * "+ Add missing …".  Matches the Dallian admin visual style (chestnut / cream).
 */
export default function InlineAddPanel({
  label,
  placeholder,
  isCreating,
  onConfirm,
  onCancel,
}: InlineAddPanelProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError(`${label} name is required.`);
      return;
    }
    setError('');
    try {
      await onConfirm(trimmed);
      setValue('');
    } catch {
      setError(`Could not add ${label.toLowerCase()}. Please try again.`);
    }
  };

  return (
    <div className="mt-2 border border-chestnut/30 bg-[#FDF6EE] p-3">
      <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-chestnut uppercase">
        Add missing {label}
      </p>
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder ?? `e.g. New ${label}…`}
          disabled={isCreating}
          className={cx(
            'flex-1 border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40',
            'focus:border-chestnut focus:outline-none disabled:opacity-50'
          )}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isCreating}
            className="bg-chestnut px-4 py-2.5 text-xs tracking-widest text-white uppercase transition-colors duration-200 hover:bg-chestnut-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? 'Adding…' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="border border-ink/20 px-4 py-2.5 text-xs tracking-widest text-ink/70 uppercase transition-colors duration-200 hover:bg-ink/5 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}
