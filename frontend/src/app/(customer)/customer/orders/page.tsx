'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PackageIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  RefreshCwIcon,
  MapPinIcon,
  CreditCardIcon,
  PhoneIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  UserIcon,
} from 'lucide-react';
import {
  fetchMyOrders,
  fetchOrderDetail,
  BackendOrderListItem,
  BackendOrderDetail,
} from '@/utils/api';
import { cx, formatKsh } from '@/utils/format';

/* ── status config ───────────────────────────────────────────────── */

const STATUS_META: Record<string, { label: string; step: number; dot: string; badge: string }> = {
  pending:            { label: 'Pending',           step: 0,  dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  payment_confirmed:  { label: 'Payment Confirmed', step: 1,  dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing:         { label: 'Preparing',         step: 2,  dot: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  ready_for_delivery: { label: 'Ready',             step: 3,  dot: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  out_for_delivery:   { label: 'Out for Delivery',  step: 4,  dot: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  delivered:          { label: 'Delivered',         step: 5,  dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled:          { label: 'Cancelled',         step: -1, dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200' },
  refunded:           { label: 'Refunded',          step: -1, dot: 'bg-rose-400',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const STEPS = ['Received', 'Payment', 'Preparing', 'Delivery', 'Delivered'];

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, badge: 'bg-ink/5 text-ink/60 border-ink/10', dot: 'bg-ink/30' };
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide', m.badge)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

/* ── compact progress bar ────────────────────────────────────────── */

function CompactOrderTimeline({ status }: { status: string }) {
  const meta = STATUS_META[status];
  if (!meta || meta.step < 0) {
    return (
      <div className="rounded-lg bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700 border border-red-200">
        This order has been {meta?.label ?? status}.
      </div>
    );
  }

  const currentStep = meta.step;

  return (
    <div className="rounded-xl border border-ink/8 bg-[#FAF8F5]/80 p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const isDone = i <= currentStep;
          const isActive = i === currentStep;

          return (
            <React.Fragment key={s}>
              <div className="flex shrink-0 items-center gap-1.5">
                <span
                  className={cx(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                    isDone
                      ? 'bg-[#8B3A2A] text-cream shadow-2xs'
                      : 'border border-ink/20 bg-white text-ink/30'
                  )}
                >
                  {isDone ? <CheckIcon width={11} height={11} strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className={cx(
                    'text-xs whitespace-nowrap',
                    isActive
                      ? 'font-bold text-[#8B3A2A]'
                      : isDone
                        ? 'font-medium text-ink'
                        : 'text-ink/40'
                  )}
                >
                  {s}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={cx(
                    'h-0.5 min-w-4 flex-1 transition-colors mx-1 sm:mx-2',
                    i < currentStep ? 'bg-[#8B3A2A]' : 'bg-ink/10'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── unified order detail section ────────────────────────────────── */

function OrderDetailSection({ orderNumber }: { orderNumber: string }) {
  const [detail, setDetail] = useState<BackendOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetail(orderNumber)
      .then(setDetail)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Couldn't load order details. Please try again.")
      )
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="space-y-3 p-5 sm:p-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-ink/5" />
        ))}
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6 text-xs sm:text-sm text-red-600">{error}</div>
    );
  }

  const subtotal    = parseFloat(detail.subtotal        || '0');
  const deliveryFee = parseFloat(detail.delivery_fee    || '0');
  const discount    = parseFloat(detail.discount_amount || '0');
  const total       = parseFloat(detail.total_amount    || '0');
  const items       = detail.items ?? [];

  return (
    <div className="border-t border-ink/10 bg-white p-4 sm:p-6 space-y-5">
      {/* 1. Compact Progress Bar */}
      <CompactOrderTimeline status={detail.status} />

      {/* 2. Unified Grid: Items on Left, Delivery & Financial Summary on Right */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        
        {/* Left: Items list */}
        <div>
          <div className="flex items-center justify-between border-b border-ink/8 pb-2.5 mb-3">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B3A2A]">
              <ShoppingBagIcon width={13} height={13} />
              <span>Items Ordered ({items.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-ink/40">Ref: {detail.order_number}</span>
          </div>

          <ul className="divide-y divide-ink/8">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3.5 py-3">
                {/* Product Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink/5 border border-ink/10">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('[data-fallback]') as HTMLElement | null;
                        fallback?.style.removeProperty('display');
                      }}
                    />
                  ) : null}
                  <div data-fallback className="hidden h-full w-full items-center justify-center">
                    <PackageIcon width={18} height={18} className="text-ink/20" />
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink line-clamp-1">
                    {item.product_name}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {item.selected_size && (
                      <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/65">
                        Size {item.selected_size}
                      </span>
                    )}
                    {item.selected_color && (
                      <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/65">
                        {item.selected_color}
                      </span>
                    )}
                    {item.selected_length && (
                      <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/65">
                        {item.selected_length}&quot;
                      </span>
                    )}
                    {item.selected_cap_type && (
                      <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/65">
                        {item.selected_cap_type}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    Qty {item.quantity} × {formatKsh(Number(item.unit_price))}
                  </p>
                </div>

                {/* Line Total */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ink">
                    {formatKsh(Number(item.total_price))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Consolidated Delivery & Payment Summary Box */}
        <div className="rounded-xl border border-ink/10 bg-[#FAF8F5]/80 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5 text-xs">
            {/* Delivery Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#8B3A2A]">
                <MapPinIcon width={12} height={12} />
                <span>Delivery &amp; Recipient</span>
              </div>
              <p className="font-semibold text-ink text-sm">
                {detail.customer_name || 'Valued Customer'}
                {detail.customer_phone ? ` · ${detail.customer_phone}` : ''}
              </p>
              {detail.delivery_address && (
                <p className="text-ink/65 leading-snug">
                  {detail.delivery_address}{detail.delivery_city ? `, ${detail.delivery_city}` : ''}
                </p>
              )}
            </div>

            {/* Payment info */}
            <div className="space-y-1 border-t border-ink/8 pt-2.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#8B3A2A]">
                <CreditCardIcon width={12} height={12} />
                <span>Payment</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink/75">{detail.payment_method_display || 'M-Pesa'}</span>
                <span className={cx(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  detail.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                )}>
                  {detail.payment_status_display}
                </span>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="space-y-1.5 border-t border-ink/8 pt-2.5">
              <div className="flex justify-between text-ink/60">
                <span>Subtotal</span>
                <span>{formatKsh(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-semibold">Free</span> : formatKsh(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>− {formatKsh(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-2 text-sm font-bold text-ink">
                <span>Total</span>
                <span className="font-serif text-base text-[#8B3A2A]">
                  {formatKsh(total)}
                </span>
              </div>
            </div>
          </div>

          {detail.customer_notes && (
            <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-900 border border-amber-200">
              <span className="font-semibold">Note: </span>{detail.customer_notes}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── order card ──────────────────────────────────────────────────── */

function OrderCard({
  order,
  index,
  totalOrders,
}: {
  order: BackendOrderListItem;
  index: number;
  totalOrders: number;
}) {
  // First order is expanded by default, others start collapsed for a clean look
  const [expanded, setExpanded] = useState(index === 0);

  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = new Date(order.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isLatest = index === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs transition hover:shadow-sm">
      {/* Top visual accent stripe */}
      <div className={cx('h-1 w-full', isLatest ? 'bg-[#8B3A2A]' : 'bg-[#D99B26]')} />

      {/* Unified Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2]/60 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            className={cx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold shadow-2xs',
              isLatest ? 'bg-[#8B3A2A] text-cream' : 'bg-black text-white'
            )}
          >
            #{totalOrders - index}
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-bold text-ink">
                {order.order_number}
              </span>
              {isLatest && (
                <span className="rounded-full bg-[#8B3A2A]/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#8B3A2A] uppercase">
                  Latest
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-ink/45 mt-0.5">
              <span>{date}</span>
              <span>•</span>
              <span>{time}</span>
              <span>•</span>
              <span>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</span>
            </div>
          </div>
        </div>

        {/* Right side: Status, Total, and Toggle button */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
          <StatusBadge status={order.status} />

          <div className="text-right">
            <p className="font-serif text-sm sm:text-base font-bold text-ink">
              {formatKsh(Number(order.total_amount))}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
            className="flex items-center gap-1 rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/75 transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] shadow-2xs"
          >
            <span className="hidden sm:inline">{expanded ? 'Hide' : 'Details'}</span>
            {expanded ? (
              <ChevronUpIcon width={14} height={14} />
            ) : (
              <ChevronDownIcon width={14} height={14} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Unified Detail Section */}
      {expanded && <OrderDetailSection orderNumber={order.order_number} />}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────── */

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<BackendOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "We couldn't load your orders right now. Please try again.")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchMyOrders()
      .then(setOrders)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "We couldn't load your orders right now. Please try again.")
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="w-full space-y-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-luxe text-[#8B3A2A]">Account Overview</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-xs sm:text-sm text-ink/55">
            {loading
              ? 'Loading your order history…'
              : orders.length === 0
                ? 'You have not placed any orders yet.'
                : `Showing ${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed with Dallian.`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          aria-label="Refresh orders"
          className="flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink/65 transition hover:border-[#8B3A2A]/40 hover:text-[#8B3A2A] disabled:opacity-40 shadow-2xs"
        >
          <RefreshCwIcon width={13} height={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink/5 border border-ink/10" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs sm:text-sm text-red-700">
          <p className="font-semibold">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 inline-block font-semibold text-red-800 underline underline-offset-2 hover:text-red-950"
          >
            Try reloading orders
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ink/15 bg-white py-14 text-center shadow-xs">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8B3A2A]/8">
            <ShoppingBagIcon width={24} height={24} className="text-[#8B3A2A]/60" />
          </span>
          <div>
            <p className="font-serif text-lg text-ink">No orders found</p>
            <p className="mt-1 text-xs sm:text-sm text-ink/45">
              Looks like you haven&apos;t placed any orders yet. Discover our latest luxury wigs.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-[#8B3A2A] px-6 py-2.5 text-xs font-semibold tracking-widest text-cream uppercase transition hover:opacity-90 shadow-xs"
          >
            Explore the Collection
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4 sm:space-y-5">
          {orders.map((order, idx) => (
            <OrderCard
              key={order.id}
              order={order}
              index={idx}
              totalOrders={orders.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
