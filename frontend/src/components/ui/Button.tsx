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
  primary:
    'bg-black text-white hover:bg-neutral-800 hover:border-neutral-800 border border-black font-semibold transition-all active:scale-[0.99] shadow-xs',
  secondary:
    'border border-neutral-300 bg-white text-black hover:bg-neutral-100 transition-all active:scale-[0.99]',
  gold:
    'bg-[#D99B26] text-black border border-[#D99B26] hover:bg-[#c88d1f] hover:border-[#c88d1f] font-semibold shadow-xs transition-all active:scale-[0.99]',
  onDark:
    'border border-[#D99B26]/80 bg-transparent text-white hover:bg-[#D99B26] hover:text-black hover:border-[#D99B26] font-medium transition-all active:scale-[0.99]',
  ghost:
    'border border-transparent bg-transparent text-white hover:bg-white/10 transition-all active:scale-[0.99]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3.5 sm:px-4 text-xs tracking-wider uppercase',
  md: 'min-h-[42px] px-4 sm:px-5 text-xs tracking-wider sm:tracking-widest uppercase',
  lg: 'min-h-[48px] px-4 sm:px-7 text-xs tracking-wider sm:tracking-[0.18em] uppercase',
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
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 text-center select-none max-w-full',
        variantClasses[variant],
        sizeClasses[size],
        className
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
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 text-center select-none max-w-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}