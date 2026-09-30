'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/components/RouterCompat';
import { brand } from '../data/brand';
import { cx } from '../utils/format';

interface LogoProps {
  onDark?: boolean;
  compact?: boolean;
  className?: string;
  to?: string;
}

export function Logo({ onDark, compact, className, to = '/' }: LogoProps) {
  return (
    <Link to={to} className={cx('group flex items-center gap-2 sm:gap-3 shrink min-w-0', className)} aria-label={`${brand.name} — home`}>
      <span className="relative block h-8 w-8 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-sm border border-gold/50 bg-black">
        <Image
          src={brand.logo}
          alt={brand.name}
          width={40}
          height={40}
          className="h-full w-full object-contain p-0.5"
          priority
          unoptimized
        />
      </span>
      <span className="flex flex-col leading-none shrink min-w-0">
        <span
          className={cx(
            'font-serif text-[13px] sm:text-[15px] font-semibold tracking-[0.1em] sm:tracking-[0.14em] truncate',
            onDark ? 'text-cream' : 'text-ink'
          )}>
          DALLIAN
        </span>
        <span className="mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] font-medium tracking-[0.25em] sm:tracking-[0.34em] text-gold truncate">LUXE HAIR</span>
        {!compact &&
        <span className={cx('mt-1 hidden text-[9px] tracking-wide lg:block', onDark ? 'text-cream/45' : 'text-ink/45')}>
            {brand.tagline}
          </span>
        }
      </span>
    </Link>);
}