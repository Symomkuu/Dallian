'use client';

import React from 'react';
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
    <Link to={to} className={cx('group flex items-center gap-3', className)} aria-label={`${brand.name} — home`}>
      <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-gold/50">
        <img
          src={brand.logo}
          alt=""
          className="h-full w-full scale-[1.55] object-cover object-[50%_22%]"
          loading="eager" />
        
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cx(
            'font-serif text-[15px] font-semibold tracking-[0.14em]',
            onDark ? 'text-cream' : 'text-ink'
          )}>
          
          DALLIAN
        </span>
        <span className="mt-1 text-[9px] font-medium tracking-[0.34em] text-gold">LUXE HAIR</span>
        {!compact &&
        <span className={cx('mt-1 hidden text-[9px] tracking-wide lg:block', onDark ? 'text-cream/45' : 'text-ink/45')}>
            {brand.tagline}
          </span>
        }
      </span>
    </Link>);

}