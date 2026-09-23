import React, { useState } from 'react';
import { reviews as seed } from '../../data/content';
import { products } from '../../data/products';
import type { Review } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { cx, formatDate } from '../../utils/format';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';

const tabs = ['published', 'pending', 'hidden'] as const;

export function AdminReviews() {
  const { pushToast } = useStore();
  const [rows, setRows] = useState<Review[]>(seed);
  const [tab, setTab] = useState<(typeof tabs)[number]>('pending');

  const setStatus = (id: string, status: Review['status'], message: string) => {
    setRows((prev) => prev.map((review) => review.id === id ? { ...review, status } : review));
    pushToast({ title: message, tone: 'success' });
  };

  const visible = rows.filter((review) => review.status === tab);
  const average = rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        body="Moderate customer reviews. Published reviews appear on the product page and can be surfaced on the homepage." />
      

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Average Rating" value={average.toFixed(1)} tone="feature" />
        <StatCard label="Awaiting Moderation" value={String(rows.filter((r) => r.status === 'pending').length)} />
        <StatCard label="Published" value={String(rows.filter((r) => r.status === 'published').length)} />
      </div>

      <div className="mt-7 flex gap-1 border-b border-ink/10">
        {tabs.map((option) =>
        <button
          key={option}
          type="button"
          onClick={() => setTab(option)}
          aria-current={tab === option}
          className={cx(
            'label-luxe -mb-px border-b-2 px-4 py-3 transition-colors duration-200',
            tab === option ? 'border-gold text-ink' : 'border-transparent text-ink/45 hover:text-ink'
          )}>
          
            {option} ({rows.filter((r) => r.status === option).length})
          </button>
        )}
      </div>

      {visible.length === 0 ?
      <p className="mt-8 text-sm text-ink/55">Nothing in this queue.</p> :

      <ul className="mt-6 space-y-4">
          {visible.map((review) => {
          const product = products.find((p) => p.id === review.productId);
          return (
            <li key={review.id} className="border border-ink/10 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <StarRating rating={review.rating} />
                    <h2 className="mt-3 font-serif text-lg text-ink">{review.title}</h2>
                    <p className="mt-1 text-xs text-ink/50">
                      {review.author} · {review.location} · {formatDate(review.date)}
                      {review.verified && <span className="ml-2 text-gold">Verified purchase</span>}
                    </p>
                  </div>
                  {product &&
                <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="h-14 w-11 object-cover" loading="lazy" />
                      <span className="text-xs text-ink/60">{product.name}</span>
                    </div>
                }
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink/70">{review.body}</p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {review.status !== 'published' &&
                <Button size="sm" onClick={() => setStatus(review.id, 'published', 'Review published.')}>
                      Publish
                    </Button>
                }
                  {review.status !== 'hidden' &&
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStatus(review.id, 'hidden', 'Review hidden.')}>
                  
                      Hide
                    </Button>
                }
                  {review.status !== 'pending' &&
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatus(review.id, 'pending', 'Review returned to queue.')}>
                  
                      Return to Queue
                    </Button>
                }
                </div>
              </li>);

        })}
        </ul>
      }
    </>);

}