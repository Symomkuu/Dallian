'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, StarIcon, XIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { createStoreProductReview } from '@/utils/api';
import type { Review } from '@/types';
import { Button } from './ui/Button';

interface WriteReviewModalProps {
  productName: string;
  productSlug: string;
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (newReview: Review) => void;
}

export function WriteReviewModal({
  productName,
  productSlug,
  productId,
  isOpen,
  onClose,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { user } = useStore();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.full_name) setAuthorName(user.full_name);
    }
  }, [user]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a comment for your review.');
      return;
    }
    const finalAuthor = authorName.trim() || user?.full_name || 'Verified Customer';

    setSubmitting(true);
    setError(null);

    try {
      const created = await createStoreProductReview(productSlug, {
        author_name: finalAuthor,
        location: location.trim(),
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      const newReview: Review = {
        id: String(created.id),
        productId: String(productId),
        author: created.author_name,
        location: created.location || location.trim() || 'Kenya',
        rating: created.rating,
        title: created.title || title.trim(),
        body: created.comment,
        date: created.created_at || new Date().toISOString(),
        verified: true,
        status: 'published',
      };

      setSuccess(true);
      onReviewSubmitted(newReview);

      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setComment('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg rounded-xl border border-ink/10 bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 p-1 text-ink/40 hover:text-ink transition-colors"
              aria-label="Close review dialog"
            >
              <XIcon width={20} height={20} />
            </button>

            {success ? (
              <div className="py-8 text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="mt-4 font-serif text-2xl text-ink">Thank You!</h3>
                <p className="mt-2 text-sm text-ink/65">
                  Your review has been shared and will appear right away.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-widest text-chestnut font-medium">
                  Review &amp; Rating
                </p>
                <h3 className="mt-1 font-serif text-2xl text-ink">
                  {productName}
                </h3>
                <p className="mt-1 text-xs text-ink/60">
                  Share your experience with this crown
                </p>

                {error && (
                  <div className="mt-4 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                      Your Rating *
                    </label>
                    <div className="mt-2 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                            aria-label={`${star} star rating`}
                          >
                            <StarIcon
                              width={26}
                              height={26}
                              className={
                                active
                                  ? 'fill-[#C89D34] text-[#C89D34]'
                                  : 'fill-ink/10 text-ink/20'
                              }
                            />
                          </button>
                        );
                      })}
                      <span className="ml-2 text-xs font-medium text-ink/60">
                        {rating} out of 5
                      </span>
                    </div>
                  </div>

                  {/* Author Name */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Wanjiru M."
                        className="mt-1 w-full rounded border border-ink/20 px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Nairobi"
                        className="mt-1 w-full rounded border border-ink/20 px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                      Headline / Summary
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Exceptional density and natural hairline"
                      className="mt-1 w-full rounded border border-ink/20 px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                    />
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                      Your Review *
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="How did it feel? How did the lace melt? What did you think of the finish?"
                      required
                      className="mt-1 w-full rounded border border-ink/20 p-3 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={onClose}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
