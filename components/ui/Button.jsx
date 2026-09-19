'use client';

import Link from 'next/link';

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm font-sans transition-[background-color,color,border-color,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-40';

const variants = {
  primary: 'bg-ink text-cream hover:bg-chestnut-deep',
  gold: 'bg-gold text-ink hover:bg-gold-light',
  secondary:
    'border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-cream',
  ghost: 'text-ink hover:text-chestnut',
  onDark:
    'border border-gold/60 text-cream hover:bg-gold hover:text-ink hover:border-gold',
};

const sizes = {
  sm: 'h-9 px-4 text-[11px] tracking-luxe uppercase',
  md: 'h-11 px-6 text-[11px] tracking-luxe uppercase',
  lg: 'h-14 px-8 text-xs tracking-luxe uppercase',
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={cx(base, variants[variant], sizes[size], className)}
      {...rest}
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
  onClick,
}) {
  return (
    <Link
      href={to}
      onClick={onClick}
      className={cx(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}