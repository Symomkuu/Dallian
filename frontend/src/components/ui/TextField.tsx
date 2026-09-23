import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cx } from '../../utils/format';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  onDark?: boolean;
}

export function TextField({ label, error, hint, onDark, className, id, ...rest }: TextFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className={cx('label-luxe', onDark ? 'text-cream/70' : 'text-ink/60')}>
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cx(
          'h-12 w-full rounded-sm border px-4 text-sm transition-colors duration-200 placeholder:text-ink/35 focus:outline-none',
          onDark ?
          'border-cream/25 bg-transparent text-cream placeholder:text-cream/40 focus:border-gold' :
          'border-ink/20 bg-white text-ink focus:border-chestnut',
          error && 'border-red-600'
        )}
        {...rest} />
      
      {hint && !error &&
      <p id={`${fieldId}-hint`} className={cx('text-xs', onDark ? 'text-cream/50' : 'text-ink/50')}>
          {hint}
        </p>
      }
      {error &&
      <p id={`${fieldId}-error`} className="flex items-center gap-1.5 text-xs text-red-700">
          <AlertCircleIcon width={13} height={13} />
          {error}
        </p>
      }
    </div>);
}