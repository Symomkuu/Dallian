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
  primary: 'bg-black text-white hover:bg-neutral-800 hover:border-neutral-800 border border-black',
  secondary: 'border border-neutral-300 bg-white text-black hover:bg-neutral-100',
  gold: 'bg-[#D99B26] text-black border border-[#D99B26] hover:bg-[#c88d1f] font-semibold',
  onDark: 'border border-[#D99B26]/80 bg-transparent text-white hover:bg-[#D99B26] hover:text-black hover:border-[#D99B26] font-medium',
  ghost: 'border border-transparent bg-transparent text-white hover:bg-white/10',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs tracking-wider uppercase',
  md: 'h-10 px-5 text-xs tracking-widest uppercase',
  lg: 'h-12 px-7 text-xs tracking-[0.2em] uppercase',
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
        'inline-flex items-center justify-center rounded-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60',
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
        'inline-flex items-center justify-center rounded-none transition-all duration-300',
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