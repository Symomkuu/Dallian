import React from 'react';
import { Star } from 'lucide-react';
import { cx } from '@/utils/format';

interface StarRatingProps {
  rating: number;
  count?: number;
  className?: string;
}

export function StarRating({ rating, count, className }: StarRatingProps) {
  const filled = Math.round(rating);

  return (
    <div className={cx('flex items-center gap-2', className)} aria-label={`Rated ${rating} out of 5`}>
      <div className="flex items-center gap-1 text-gold">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            width={14}
            height={14}
            className={cx(index < filled ? 'fill-current text-gold' : 'text-ink/15')}
          />
        ))}
      </div>
      {typeof count === 'number' && (
        <span className="text-[11px] text-ink/50">({count})</span>
      )}
    </div>
  );
}
