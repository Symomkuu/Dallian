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
        'flex h-full flex-col justify-between border p-7 transition-colors duration-200',
        onDark
          ? 'border-white/10 bg-[#121111] text-white'
          : 'border-ink/10 bg-white text-ink'
      )}
    >
      <div>
        {/* Star Rating & Numeric Score */}
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} />
          <span className="text-xs text-white/20">
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-5 font-serif text-xl font-normal text-white">
          {review.title}
        </h3>

        {/* Quote / Body */}
        <p className="mt-3 text-sm leading-relaxed text-gray-300/90">
          “{review.body}”
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-normal text-gray-300">
            <span>{review.author}</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">{review.location}</span>
          </div>

          {review.verified && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-[#C89D34]">
              <CheckCircle2Icon width={13} height={13} strokeWidth={2} />
              Verified
            </span>
          )}
        </div>

        {/* Date */}
        <p className="mt-1.5 text-[11px] text-gray-500">
          {formatDate(review.date)}
        </p>
      </div>
    </article>
  );
}