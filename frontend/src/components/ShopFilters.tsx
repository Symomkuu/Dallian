import React from 'react';
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

const groups: { key: keyof FilterState; label: string; options: string[] }[] = [
  {
    key: 'styles',
    label: 'Hair Style / Texture',
    options: ['Straight', 'Body Wave', 'Deep Wave', 'Curly', 'Bob', 'Bone Straight', 'Kinky Curly'],
  },
  {
    key: 'availability',
    label: 'Availability',
    options: ['in-stock', 'low-stock', 'out-of-stock'],
  },
];

const optionLabels: Record<string, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};

interface ShopFiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onClose?: () => void;
  resultCount: number;
}

export function ShopFilters({ value, onChange, onClose, resultCount }: ShopFiltersProps) {
  const toggle = (key: keyof FilterState, option: string) => {
    const current = value[key] as string[];
    onChange({
      ...value,
      [key]: current.includes(option) ? current.filter((x) => x !== option) : [...current, option]
    });
  };

  const activeCount =
  groups.reduce((sum, group) => sum + (value[group.key] as string[]).length, 0) + (
  value.maxPrice < 35000 ? 1 : 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink/10 pb-4">
        <h2 className="font-serif text-xl text-ink">Filters</h2>
        <div className="flex items-center gap-3">
          {activeCount > 0 &&
          <button
            type="button"
            onClick={() => onChange(emptyFilters)}
            className="text-[11px] tracking-wide text-chestnut underline-offset-4 hover:underline">
            
              Clear all
            </button>
          }
          {onClose &&
          <button type="button" onClick={onClose} aria-label="Close filters" className="p-1 text-ink/55 lg:hidden">
              <XIcon width={20} height={20} />
            </button>
          }
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <fieldset className="border-b border-ink/10 py-6">
          <legend className="label-luxe mb-4 text-ink/55">Price Range</legend>
          <input
            type="range"
            min={8000}
            max={35000}
            step={1000}
            value={value.maxPrice}
            onChange={(event) => onChange({ ...value, maxPrice: Number(event.target.value) })}
            aria-label="Maximum price"
            className="w-full accent-chestnut" />
          
          <div className="mt-2 flex justify-between text-xs text-ink/60">
            <span>{formatKsh(8000)}</span>
            <span className="text-ink">Up to {formatKsh(value.maxPrice)}</span>
          </div>
        </fieldset>

        {groups.map((group) =>
        <fieldset key={group.key} className="border-b border-ink/10 py-6 last:border-b-0">
            <legend className="label-luxe mb-3.5 text-ink/55">{group.label}</legend>
            <div className="space-y-2.5">
              {group.options.map((option) => {
              const checked = (value[group.key] as string[]).includes(option);
              return (
                <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-ink/75">
                    <span
                    className={cx(
                      'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-150',
                      checked ? 'border-chestnut bg-chestnut' : 'border-ink/30 bg-white'
                    )}>
                    
                      {checked && <span className="h-1.5 w-1.5 bg-gold" />}
                    </span>
                    <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(group.key, option)}
                    className="sr-only" />
                  
                    {optionLabels[option] ?? option}
                  </label>);

            })}
            </div>
          </fieldset>
        )}
      </div>
    </div>);

}