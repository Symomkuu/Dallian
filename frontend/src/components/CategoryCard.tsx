import React from 'react';
import { Link } from '@/components/RouterCompat';
import { ArrowRightIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  body: string;
  cta: string;
  to: string;
  image: string;
  eyebrow?: string;
  tall?: boolean;
}

export function CategoryCard({ title, body, cta, to, image, eyebrow, tall }: CategoryCardProps) {
  return (
    <Link
      to={to}
      className="group relative block overflow-hidden bg-ink"
      aria-label={`${title} — ${cta}`}>
      
      <img
        src={image}
        alt={title}
        loading="lazy"
        className={
        tall ?
        'aspect-[3/4] w-full object-cover opacity-90 transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-[1.04]' :
        'aspect-[4/5] w-full object-cover opacity-90 transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-[1.04] sm:aspect-[5/6]'
        } />
      
      <div className="absolute inset-0 bg-ink/45" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
        {eyebrow && <p className="label-luxe mb-3 text-gold">{eyebrow}</p>}
        <h3 className="font-serif text-2xl leading-tight text-cream sm:text-3xl">{title}</h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/75">{body}</p>
        <span className="label-luxe mt-6 inline-flex items-center gap-2 border-b border-gold/60 pb-1.5 text-cream transition-colors duration-200 group-hover:border-gold group-hover:text-gold">
          {cta}
          <ArrowRightIcon width={14} height={14} />
        </span>
      </div>
    </Link>);

}