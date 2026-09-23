import React from 'react';
import { ArrowRight as ArrowRightIcon } from 'lucide-react';
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
      className="group relative flex aspect-[4/5] min-h-[460px] w-full flex-col justify-end overflow-hidden bg-neutral-900"
      aria-label={`${title} — ${cta}`}
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* Overlaid content aligned at the bottom */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#D99B26]">
            {eyebrow}
          </p>
        )}

        <h3 className="mt-2 font-serif text-2xl font-normal text-white sm:text-3xl">
          {title}
        </h3>

        <p className="mt-2.5 max-w-sm text-sm font-light leading-relaxed text-neutral-300">
          {body}
        </p>

        <span className="mt-6 inline-flex items-center gap-2 border-b border-[#D99B26] pb-1 text-xs font-semibold tracking-[0.2em] uppercase text-[#D99B26] transition-colors duration-200 group-hover:text-amber-300">
          {cta}
          <ArrowRightIcon width={14} height={14} />
        </span>
      </div>
    </Link>
  );
}