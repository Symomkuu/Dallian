import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cx } from '../../utils/format';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: {value: string;label: string;}[];
  hideLabel?: boolean;
}

export function SelectField({ label, options, hideLabel, className, id, ...rest }: SelectFieldProps) {
  const fieldId = id ?? `select-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className={cx('label-luxe text-ink/60', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          className="h-11 w-full appearance-none rounded-sm border border-ink/20 bg-white pl-4 pr-10 text-sm text-ink transition-colors duration-200 focus:border-chestnut focus:outline-none"
          {...rest}>
          
          {options.map((option) =>
          <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        <ChevronDownIcon
          width={15}
          height={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/45" />
        
      </div>
    </div>);

}