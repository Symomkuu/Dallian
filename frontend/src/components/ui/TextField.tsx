import React, { useState } from 'react';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { cx } from '../../utils/format';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  onDark?: boolean;
}

export function TextField({
  label,
  error,
  hint,
  onDark,
  className,
  id,
  type = 'text',
  ...rest
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const fieldId = id ?? `field-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className={cx('label-luxe', onDark ? 'text-cream/70' : 'text-ink/60')}>
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={fieldId}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cx(
            'h-12 w-full rounded-xl border px-4 text-sm transition-colors duration-200 placeholder:text-ink/35 focus:outline-none',
            isPassword && 'pr-11',
            onDark
              ? 'border-cream/25 bg-transparent text-cream placeholder:text-cream/40 focus:border-gold'
              : 'border-ink/20 bg-white text-ink focus:border-chestnut',
            error && 'border-red-600'
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            className={cx(
              'absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded-md transition-colors focus:outline-none',
              onDark
                ? 'text-cream/50 hover:text-cream focus-visible:ring-1 focus-visible:ring-gold'
                : 'text-ink/40 hover:text-ink focus-visible:ring-1 focus-visible:ring-chestnut'
            )}
          >
            {showPassword ? (
              <EyeOffIcon width={18} height={18} aria-hidden="true" />
            ) : (
              <EyeIcon width={18} height={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={`${fieldId}-hint`} className={cx('text-xs', onDark ? 'text-cream/50' : 'text-ink/50')}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="flex items-center gap-1.5 text-xs text-red-700">
          <AlertCircleIcon width={13} height={13} />
          {error}
        </p>
      )}
    </div>
  );
}