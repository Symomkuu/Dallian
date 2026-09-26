'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import {
  fetchMyOrders,
  fetchOrderDetail,
  BackendOrderListItem,
  BackendOrderDetail,
} from '@/utils/api';
import { cx } from '@/utils/format';

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
  const m = STATUS_META[status] ?? { label: status, badge: 'bg-ink/5 text-ink/60 border-ink/10' };
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-2xs', m.badge)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', m.dot ?? 'bg-ink/30')} />
      {m.label}
    </span>
  );
}

/* ── progress timeline ───────────────────────────────────────────── */

function OrderTimeline({ status }: { status: string }) {
  const meta = STATUS_META[status];
  if (!meta || meta.step < 0) {
    return (
      <p className="text-xs font-medium text-red-600">
        This order has been {meta?.label ?? status}.
      </p>
    );
  }
  const step = meta.step;
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[340px] items-start">
        {STEPS.map((s, i) => {
          const done = i <= step;
          const active = i === step;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 56 }}>
                <div className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all',
                  done
                    ? 'border-[#8B3A2A] bg-[#8B3A2A] text-cream shadow-sm'
                    : 'border-ink/15 bg-white text-ink/25'
                )}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={cx(
                  'text-center text-[9px] font-medium leading-tight',
                  active ? 'text-[#8B3A2A] font-bold' : done ? 'text-ink/65 font-medium' : 'text-ink/30'
                )}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cx(
                  'mt-3.5 h-0.5 flex-1 transition-colors',
                  i < step ? 'bg-[#8B3A2A]' : 'bg-ink/10'
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── order detail panel ──────────────────────────────────────────── */

function OrderDetailPanel({ orderNumber }: { orderNumber: string }) {
  const [detail, setDetail] = useState<BackendOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchOrderDetail(orderNumber)
      .then(setDetail)
      .catch(() => setError("Couldn't load order details. Please try again."))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="space-y-3 p-5 sm:p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-ink/5" />
        ))}
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6 text-sm text-red-600">{error}</div>
    );
  }

  const subtotal    = parseFloat(detail.subtotal        || '0');
  const deliveryFee = parseFloat(detail.delivery_fee    || '0');
  const discount    = parseFloat(detail.discount_amount || '0');
  const total       = parseFloat(detail.total_amount    || '0');
  const items       = detail.items ?? [];

  return (
    <div className="border-t border-ink/10 bg-[#FAF7F2] p-4 sm:p-6 space-y-5">
      {/* 1. Progress section */}
      <div className="rounded-xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B3A2A]">
          Order Progress
        </p>
        <OrderTimeline status={detail.status} />
      </div>

      {/* 2. Items section */}
      <div className="rounded-xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B3A2A]">
            Items Ordered ({items.length})
          </p>
          <span className="text-xs text-ink/45">
            Reference: <span className="font-mono text-ink/70 font-semibold">{detail.order_number}</span>
          </span>
        </div>

        <ul className="divide-y divide-ink/8 overflow-hidden rounded-lg border border-ink/10 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3.5 p-3.5 sm:p-4 hover:bg-[#FAF8F5]/60 transition-colors">
              {/* image */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink/5 border border-ink/8">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PackageIcon width={20} height={20} className="text-ink/20" />
                  </div>
                )}
              </div>

              {/* details */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink line-clamp-2 leading-snug">
                  {item.product_name}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {item.selected_size     && <span className="rounded bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/65">Size: {item.selected_size}</span>}
                  {item.selected_color    && <span className="rounded bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/65">{item.selected_color}</span>}
                  {item.selected_length   && <span className="rounded bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/65">{item.selected_length}&quot;</span>}
                  {item.selected_cap_type && <span className="rounded bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/65">{item.selected_cap_type}</span>}
                </div>
                <p className="mt-1.5 text-xs text-ink/50">
                  Qty {item.quantity} × KSh {Number(item.unit_price).toLocaleString()}
                </p>
              </div>

              {/* line total */}
              <div className="shrink-0 text-right pt-0.5">
                <p className="text-sm font-bold text-ink">
                  KSh {Number(item.total_price).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Summary + Delivery & Payment side-by-side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* order total summary */}
        <div className="rounded-xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="mb-3.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B3A2A]">
              <ReceiptTextIcon width={12} height={12} /> Payment Summary
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd className="font-medium text-ink">KSh {subtotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Delivery Fee</dt>
                <dd className="font-medium text-ink">
                  {deliveryFee === 0
                    ? <span className="font-semibold text-emerald-700">Free</span>
                    : `KSh ${deliveryFee.toLocaleString()}`}
                </dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd>− KSh {discount.toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="mt-4 border-t border-ink/10 pt-3 flex justify-between items-baseline">
            <dt className="text-sm font-semibold text-ink">Total Amount</dt>
            <dd className="font-serif text-lg font-bold text-[#8B3A2A]">
              KSh {total.toLocaleString()}
            </dd>
          </div>
        </div>

        {/* delivery & recipient details */}
        <div className="rounded-xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs">
          <p className="mb-3.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B3A2A]">
            <MapPinIcon width={12} height={12} /> Delivery & Recipient
          </p>
          <dl className="space-y-2.5 text-sm">
            {detail.customer_name && (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-ink/35">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-ink/40">Recipient</p>
                  <p className="font-medium text-ink">{detail.customer_name}</p>
                </div>
              </div>
            )}
            {detail.customer_phone && (
              <div className="flex items-start gap-2.5">
                <PhoneIcon width={14} height={14} className="mt-0.5 shrink-0 text-ink/35" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-ink/40">Phone</p>
                  <p className="text-ink/80">{detail.customer_phone}</p>
                </div>
              </div>
            )}
            {detail.delivery_address && (
              <div className="flex items-start gap-2.5">
                <MapPinIcon width={14} height={14} className="mt-0.5 shrink-0 text-ink/35" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-ink/40">Destination</p>
                  <p className="text-ink/80 leading-snug">
                    {detail.delivery_address}
                    {detail.delivery_city ? `, ${detail.delivery_city}` : ''}
                  </p>
                </div>
              </div>
            )}
            {detail.payment_method_display && (
              <div className="flex items-start gap-2.5">
                <CreditCardIcon width={14} height={14} className="mt-0.5 shrink-0 text-ink/35" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-ink/40">Payment Status</p>
                  <p className="text-ink/80">
                    {detail.payment_method_display}
                    {' · '}
                    <span className={detail.payment_status === 'paid' ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
                      {detail.payment_status_display}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>

      {detail.customer_notes && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <span className="font-semibold">Special Instructions: </span>
          {detail.customer_notes}
        </div>
      )}
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
  const [expanded, setExpanded] = useState(true);

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
    <div
      className={cx(
        'overflow-hidden rounded-2xl border-2 bg-white transition-all shadow-sm hover:shadow-md',
        isLatest ? 'border-[#8B3A2A]/40' : 'border-ink/15'
      )}
    >
      {/* Top visual accent stripe */}
      <div
        className={cx(
          'h-1.5 w-full',
          isLatest ? 'bg-[#8B3A2A]' : 'bg-[#D99B26]'
        )}
      />

      {/* Distinct Header Banner */}
      <div className="border-b border-ink/10 bg-[#F7F3EC] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Order reference and date */}
          <div className="flex items-center gap-3">
            <span
              className={cx(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs font-bold text-xs',
                isLatest
                  ? 'bg-[#8B3A2A] text-cream'
                  : 'bg-black text-white'
              )}
            >
              #{index + 1}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-wider text-ink">
                  {order.order_number}
                </span>
                {isLatest && (
                  <span className="rounded-full bg-[#8B3A2A]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#8B3A2A] uppercase">
                    Latest Order
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-xs text-ink/50">
                <span className="flex items-center gap-1">
                  <CalendarIcon width={12} height={12} />
                  {date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ClockIcon width={12} height={12} />
                  {time}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Status, Total, and Toggle button */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
            {/* Status badge */}
            <div>
              <StatusBadge status={order.status} />
            </div>

            {/* Total and item count */}
            <div className="text-right">
              <p className="font-serif text-base font-bold text-ink sm:text-lg">
                KSh {Number(order.total_amount).toLocaleString()}
              </p>
              <p className="text-xs text-ink/45">
                {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Expand / Collapse toggle */}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
              className="flex items-center gap-1 rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink/75 transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] shadow-2xs"
            >
              <span className="hidden md:inline">
                {expanded ? 'Collapse' : 'Details'}
              </span>
              {expanded ? (
                <ChevronUpIcon width={15} height={15} />
              ) : (
                <ChevronDownIcon width={15} height={15} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Order Content */}
      {expanded && <OrderDetailPanel orderNumber={order.order_number} />}

      {/* Bottom Footer Band for the Order Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-[#F7F3EC] px-4 py-3 sm:px-6 text-xs text-ink/60">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Order #{index + 1} of {totalOrders}:</span>
          <span className="font-mono">{order.order_number}</span>
          <span>•</span>
          <span>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-[#8B3A2A] hover:underline flex items-center gap-1 ml-auto"
        >
          {expanded ? 'Collapse Order Details ↑' : 'Show Full Order Details ↓'}
        </button>
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────── */

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<BackendOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch {
      setError("We couldn't load your orders right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="w-full space-y-7">

      {/* page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-luxe text-[#8B3A2A]">Account Overview</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-ink/55">
            {loading
              ? 'Loading your order history…'
              : orders.length === 0
                ? 'You have not placed any orders yet.'
                : `Showing ${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed with Dallian.`}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Refresh orders"
          className="flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink/65 transition hover:border-[#8B3A2A]/40 hover:text-[#8B3A2A] disabled:opacity-40 shadow-2xs"
        >
          <RefreshCwIcon width={13} height={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* loading skeletons */}
      {loading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink/5 border border-ink/10" />
          ))}
        </div>
      )}

      {/* error state */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
          <button
            onClick={load}
            className="mt-2 inline-block font-semibold text-red-800 underline underline-offset-2 hover:text-red-950"
          >
            Try reloading orders
          </button>
        </div>
      )}

      {/* empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-ink/15 bg-white py-16 text-center shadow-xs">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8B3A2A]/8">
            <ShoppingBagIcon width={28} height={28} className="text-[#8B3A2A]/60" />
          </span>
          <div>
            <p className="font-serif text-lg text-ink/75">No orders found</p>
            <p className="mt-1 text-sm text-ink/45">
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

      {/* orders list with clear separation */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-8 sm:space-y-10">
          {orders.map((order, idx) => (
            <React.Fragment key={order.id}>
              <OrderCard
                order={order}
                index={idx}
                totalOrders={orders.length}
              />
              {idx < orders.length - 1 && (
                <div className="flex items-center gap-4 py-2" aria-hidden="true">
                  <div className="h-px flex-1 bg-ink/15" />
                  <span className="rounded-full border border-ink/15 bg-[#F6F2EC] px-3 py-1 text-[10px] font-bold tracking-widest text-ink/40 uppercase">
                    Order {idx + 2} of {orders.length}
                  </span>
                  <div className="h-px flex-1 bg-ink/15" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
