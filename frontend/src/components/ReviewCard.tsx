import React from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import type { Review } from '../types';
import { cx, formatDate } from '../utils/format';
import { StarRating } from './ui/StarRating';

interface ReviewCardProps {
  review: Review;
  onDark?: boolean;
}

export function ReviewCard({ review, onDark = true }: ReviewCardProps) {
  return (
    <article
      className={cx(
        'flex h-full flex-col justify-between border p-5 transition-colors duration-200 sm:p-7',
        onDark
          ? 'border-white/10 bg-[#121111] text-white'
          : 'border-ink/10 bg-white text-ink'
      )}
    >
      <div>
        {/* Star Rating & Numeric Score */}
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} />
          <span className={cx('text-xs', onDark ? 'text-white/40' : 'text-ink/40')}>
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* Title */}
        <h3
          className={cx(
            'mt-4 font-serif text-lg font-normal sm:mt-5 sm:text-xl',
            onDark ? 'text-white' : 'text-ink'
          )}
        >
          {review.title}
        </h3>

        {/* Quote / Body */}
        <p
          className={cx(
            'mt-2.5 text-sm leading-relaxed sm:mt-3',
            onDark ? 'text-gray-300/90' : 'text-ink/70'
          )}
        >
          “{review.body}”
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-2 sm:mt-8">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          <div
            className={cx(
              'flex items-center gap-1.5 font-normal',
              onDark ? 'text-gray-300' : 'text-ink/70'
            )}
          >
            <span>{review.author}</span>
            <span className={onDark ? 'text-gray-600' : 'text-ink/30'}>·</span>
            <span className={onDark ? 'text-gray-400' : 'text-ink/50'}>
              {review.location}
            </span>
          </div>

          {review.verified && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-[#C89D34]">
              <CheckCircle2Icon width={13} height={13} strokeWidth={2} />
              Verified
            </span>
          )}
        </div>

        {/* Date */}
        <p className={cx('mt-1.5 text-[11px]', onDark ? 'text-gray-500' : 'text-ink/40')}>
          {formatDate(review.date)}
        </p>
      </div>
    </article>
  );
}