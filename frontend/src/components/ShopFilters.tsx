'use client';

import React, { useMemo } from 'react';
import { XIcon } from 'lucide-react';
import { cx, formatKsh } from '../utils/format';

export interface FilterState {
  categories: string[];
  styles: string[];
  availability: string[];
  maxPrice: number;
}

export const emptyFilters: FilterState = {
  categories: [],
  styles: [],
  availability: [],
  maxPrice: 60000,
};

export interface CategoryFilterOption {
  id: number | string;
  name: string;
  slug: string;
}

export interface HairStyleFilterOption {
  id: number | string;
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onClose?: () => void;
  resultCount?: number;
  availableCategories?: CategoryFilterOption[];
  availableHairStyles?: HairStyleFilterOption[];
}

const availabilityOptions = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

export function ShopFilters({
  value,
  onChange,
  onClose,
  availableCategories = [],
  availableHairStyles = [],
}: ShopFiltersProps) {
  // Sort categories alphabetically (A-Z)
  const categoryOptions: CategoryFilterOption[] = useMemo(() => {
    const list =
      availableCategories.length > 0
        ? availableCategories
        : [
            { id: 'human-hair', name: 'Premium Human Hair', slug: 'human-hair' },
            { id: 'futura', name: 'Japanese Futura Fibre', slug: 'futura' },
          ];
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [availableCategories]);

  // Sort hairstyles pulled from backend alphabetically (A-Z) with fallback
  const hairStyleOptions: HairStyleFilterOption[] = useMemo(() => {
    if (availableHairStyles && availableHairStyles.length > 0) {
      return [...availableHairStyles].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
    }
    return [
      { id: 'bob', name: 'Bob', slug: 'bob' },
      { id: 'body-wave', name: 'Body Wave', slug: 'body-wave' },
      { id: 'bone-straight', name: 'Bone Straight', slug: 'bone-straight' },
      { id: 'curly', name: 'Curly', slug: 'curly' },
      { id: 'deep-wave', name: 'Deep Wave', slug: 'deep-wave' },
      { id: 'kinky-curly', name: 'Kinky Curly', slug: 'kinky-curly' },
      { id: 'straight', name: 'Straight', slug: 'straight' },
    ];
  }, [availableHairStyles]);

  const toggleCategory = (cat: CategoryFilterOption) => {
    const current = value.categories;
    const isSelected =
      current.includes(cat.slug) ||
      current.includes(cat.name) ||
      current.some(
        (c) => c.toLowerCase() === cat.slug.toLowerCase() || c.toLowerCase() === cat.name.toLowerCase()
      );

    const nextCategories = isSelected
      ? current.filter(
          (c) =>
            c.toLowerCase() !== cat.slug.toLowerCase() &&
            c.toLowerCase() !== cat.name.toLowerCase()
        )
      : [...current, cat.slug];

    onChange({
      ...value,
      categories: nextCategories,
    });
  };

  const toggleStyle = (style: HairStyleFilterOption) => {
    const current = value.styles;
    const isSelected =
      current.includes(style.slug) ||
      current.includes(style.name) ||
      current.some(
        (s) => s.toLowerCase() === style.slug.toLowerCase() || s.toLowerCase() === style.name.toLowerCase()
      );

    const nextStyles = isSelected
      ? current.filter(
          (s) =>
            s.toLowerCase() !== style.slug.toLowerCase() &&
            s.toLowerCase() !== style.name.toLowerCase()
        )
      : [...current, style.name];

    onChange({
      ...value,
      styles: nextStyles,
    });
  };

  const toggleAvailability = (optValue: string) => {
    const current = value.availability;
    const next = current.includes(optValue)
      ? current.filter((x) => x !== optValue)
      : [...current, optValue];

    onChange({
      ...value,
      availability: next,
    });
  };

  const activeCount =
    value.categories.length +
    value.styles.length +
    value.availability.length +
    (value.maxPrice < 35000 ? 1 : 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink/10 pb-4">
        <h2 className="font-serif text-xl text-ink">Filters</h2>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange(emptyFilters)}
              className="text-[11px] tracking-wide text-chestnut underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="p-1 text-ink/55 lg:hidden"
            >
              <XIcon width={20} height={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {/* Category Filter (Alphabetical order) */}
        <fieldset className="border-b border-ink/10 py-6">
          <legend className="label-luxe mb-3.5 text-ink/55">Category</legend>
          <div className="space-y-2.5">
            {categoryOptions.map((cat) => {
              const checked =
                value.categories.includes(cat.slug) ||
                value.categories.includes(cat.name) ||
                value.categories.some(
                  (c) => c.toLowerCase() === cat.slug.toLowerCase() || c.toLowerCase() === cat.name.toLowerCase()
                );

              return (
                <label key={cat.id || cat.slug} className="flex cursor-pointer items-center gap-3 text-sm text-ink/75">
                  <span
                    className={cx(
                      'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-150',
                      checked ? 'border-chestnut bg-chestnut' : 'border-ink/30 bg-white'
                    )}
                  >
                    {checked && <span className="h-1.5 w-1.5 bg-gold" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                    className="sr-only"
                  />
                  {cat.name}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Hair Style / Texture Filter (Pulled from Backend & Alphabetical) */}
        <fieldset className="border-b border-ink/10 py-6">
          <legend className="label-luxe mb-3.5 text-ink/55">Hair Style / Texture</legend>
          <div className="space-y-2.5">
            {hairStyleOptions.map((style) => {
              const checked =
                value.styles.includes(style.slug) ||
                value.styles.includes(style.name) ||
                value.styles.some(
                  (s) => s.toLowerCase() === style.slug.toLowerCase() || s.toLowerCase() === style.name.toLowerCase()
                );

              return (
                <label key={style.id || style.slug} className="flex cursor-pointer items-center gap-3 text-sm text-ink/75">
                  <span
                    className={cx(
                      'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-150',
                      checked ? 'border-chestnut bg-chestnut' : 'border-ink/30 bg-white'
                    )}
                  >
                    {checked && <span className="h-1.5 w-1.5 bg-gold" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStyle(style)}
                    className="sr-only"
                  />
                  {style.name}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Price Range Filter (Starting from 7,000) */}
        <fieldset className="border-b border-ink/10 py-6">
          <legend className="label-luxe mb-4 text-ink/55">Price Range</legend>
          <input
            type="range"
            min={7000}
            max={35000}
            step={1000}
            value={value.maxPrice > 35000 ? 35000 : value.maxPrice}
            onChange={(event) => onChange({ ...value, maxPrice: Number(event.target.value) })}
            aria-label="Maximum price"
            className="w-full accent-chestnut"
          />
          <div className="mt-2 flex justify-between text-xs text-ink/60">
            <span>{formatKsh(7000)}</span>
            <span className="text-ink">Up to {formatKsh(value.maxPrice > 35000 ? 35000 : value.maxPrice)}</span>
          </div>
        </fieldset>

        {/* Availability Filter */}
        <fieldset className="py-6">
          <legend className="label-luxe mb-3.5 text-ink/55">Availability</legend>
          <div className="space-y-2.5">
            {availabilityOptions.map((opt) => {
              const checked = value.availability.includes(opt.value);
              return (
                <label key={opt.value} className="flex cursor-pointer items-center gap-3 text-sm text-ink/75">
                  <span
                    className={cx(
                      'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-150',
                      checked ? 'border-chestnut bg-chestnut' : 'border-ink/30 bg-white'
                    )}
                  >
                    {checked && <span className="h-1.5 w-1.5 bg-gold" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAvailability(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}