import React from 'react';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/components/RouterCompat';

interface CategoryCardProps {
  title: string;
  body: string;
  cta: string;
  to: string;
  image: string;
  eyebrow?: string;
  tall?: boolean;
}

export function CategoryCard({ title, body, cta, to, image, eyebrow }: CategoryCardProps) {
  return (
    <Link
      to={to}
      className="group relative flex aspect-[4/5] min-h-[220px] w-full flex-col justify-end overflow-hidden bg-neutral-900 sm:min-h-[380px] lg:min-h-[460px]"
      aria-label={`${title} — ${cta}`}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* Overlaid content aligned at the bottom */}
      <div className="relative z-10 p-3.5 sm:p-8 lg:p-10">
        {eyebrow && (
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#D99B26] sm:text-[11px] sm:tracking-[0.25em]">
            {eyebrow}
          </p>
        )}

        <h3 className="mt-1.5 font-serif text-base font-normal text-white sm:mt-2 sm:text-2xl lg:text-3xl">
          {title}
        </h3>

        <p className="mt-1.5 hidden max-w-sm text-sm font-light leading-relaxed text-neutral-300 sm:mt-2.5 sm:block">
          {body}
        </p>

        <span className="mt-3 inline-flex items-center gap-1.5 border-b border-[#D99B26] pb-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-[#D99B26] transition-colors duration-200 group-hover:text-amber-300 sm:mt-6 sm:gap-2 sm:text-xs sm:tracking-[0.2em]">
          {cta}
          <ArrowRightIcon width={12} height={12} className="sm:hidden" />
          <ArrowRightIcon width={14} height={14} className="hidden sm:block" />
        </span>
      </div>
    </Link>
  );
}