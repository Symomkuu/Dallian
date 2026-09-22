import Link from 'next/link';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/utils/format';

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'onDark' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border border-ink bg-ink text-cream hover:bg-chestnut-deep hover:border-chestnut-deep',
  secondary: 'border border-ink/20 bg-white text-ink hover:border-ink hover:bg-cream',
  gold: 'border border-gold bg-gold text-ink hover:bg-gold/90',
  onDark: 'border border-gold/60 bg-transparent text-cream hover:border-gold hover:bg-gold/10',
  ghost: 'border border-transparent bg-transparent text-ink hover:bg-ink/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'label-luxe inline-flex items-center justify-center gap-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={to}
      className={cx(
        'label-luxe inline-flex items-center justify-center gap-2 transition-colors duration-200',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
