import React from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import type { Review } from '../types';
import { cx, formatDate } from '../utils/format';
import { StarRating } from './ui/StarRating';

interface ReviewCardProps {
  review: Review;
  onDark?: boolean;
}

export function ReviewCard({ review, onDark }: ReviewCardProps) {
  return (
    <article
      className={cx(
        'flex h-full flex-col border p-7',
        onDark ? 'border-cream/15 bg-ink-soft' : 'border-ink/10 bg-white'
      )}>
      
      <StarRating rating={review.rating} />
      <h3 className={cx('mt-4 font-serif text-lg', onDark ? 'text-cream' : 'text-ink')}>{review.title}</h3>
      <p className={cx('mt-3 text-sm leading-relaxed', onDark ? 'text-cream/65' : 'text-ink/65')}>
        “{review.body}”
      </p>
      <div className={cx('mt-auto flex items-center gap-2 pt-6 text-xs', onDark ? 'text-cream/50' : 'text-ink/50')}>
        <span className={onDark ? 'text-cream/80' : 'text-ink/80'}>{review.author}</span>
        <span aria-hidden="true">·</span>
        <span>{review.location}</span>
        {review.verified &&
        <span className="ml-auto inline-flex items-center gap-1 text-gold">
            <BadgeCheckIcon width={13} height={13} />
            Verified
          </span>
        }
      </div>
      <p className={cx('mt-1 text-[11px]', onDark ? 'text-cream/35' : 'text-ink/35')}>{formatDate(review.date)}</p>
    </article>);

}