'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  HelpCircleIcon,
  PackageCheckIcon,
  PackageIcon,
  PhoneCallIcon,
  SearchIcon,
  ShieldCheckIcon,
  TruckIcon,
} from 'lucide-react';
import { trackOrder, type BackendOrderDetail, type BackendOrderItem } from '@/utils/api';
import { formatKsh, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { products } from '@/data/products';

function resolveOrderItemImage(item: BackendOrderItem): string {
  if (item.product_image && item.product_image.trim()) {
    return item.product_image.trim();
  }

  // 1. Try matching by product_id
  if (item.product_id != null) {
    const byId = products.find((p) => String(p.id) === String(item.product_id));
    if (byId && byId.images?.length > 0) {
      if (item.selected_color) {
        const colorMatch = byId.colors?.find(
          (c) => c.name.toLowerCase() === item.selected_color.toLowerCase()
        );
        if (colorMatch?.image) return colorMatch.image;
      }
      return byId.images[0];
    }
  }

  // 2. Try matching by product_name
  if (item.product_name) {
    const cleanName = item.product_name.toLowerCase().trim();
    const byName = products.find(
      (p) =>
        p.name.toLowerCase().trim() === cleanName ||
        cleanName.includes(p.name.toLowerCase().trim()) ||
        p.name.toLowerCase().trim().includes(cleanName)
    );
    if (byName && byName.images?.length > 0) {
      if (item.selected_color) {
        const colorMatch = byName.colors?.find(
          (c) => c.name.toLowerCase() === item.selected_color.toLowerCase()
        );
        if (colorMatch?.image) return colorMatch.image;
      }
      return byName.images[0];
    }
  }

  // 3. Fallback to first featured wig image so the user never sees a missing box
  return products[0]?.images?.[0] || '';
}

// Milestone statuses for the luxury order tracker
const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received', desc: 'Order logged & awaiting confirmation' },
  { key: 'payment_confirmed', label: 'Payment Confirmed', desc: 'Payment verified by Dallian Luxe' },
  { key: 'processing', label: 'Preparing Parcel', desc: 'Custom styling, washing & packaging' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'With rider or dispatch courier' },
  { key: 'delivered', label: 'Delivered', desc: 'Safely handed over to you' },
];

function getStepIndex(status: string): number {
  switch (status.toLowerCase()) {
    case 'pending':
      return 0;
    case 'payment_confirmed':
      return 1;
    case 'processing':
    case 'ready_for_delivery':
      return 2;
    case 'out_for_delivery':
      return 3;
    case 'delivered':
      return 4;
    default:
      return 0;
  }
}

const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  payment_confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  processing: 'bg-purple-50 text-purple-800 border-purple-200',
  ready_for_delivery: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  out_for_delivery: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
  refunded: 'bg-stone-100 text-stone-700 border-stone-300',
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('order') || searchParams.get('order_number') || '';

  const [orderNumber, setOrderNumber] = useState(initialId);
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<BackendOrderDetail | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-search if ID is present in query parameters
  useEffect(() => {
    if (initialId && !order) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (targetId?: string) => {
    const idToSearch = (targetId || orderNumber).trim();
    if (!idToSearch) {
      setError('Please enter your Order Reference Number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await trackOrder(idToSearch, contact.trim() || undefined);
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setError(
        err?.message ||
          'We could not find an order matching that reference. Please check your order ID and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCancelled = order?.status === 'cancelled' || order?.status === 'refunded';
  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5]/80 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="label-luxe text-chestnut">Live Parcel Tracking</p>
          <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Track Your Order</h1>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-ink/60">
            Enter your order reference number below to view your current order status, shipment dispatch, and receipt.
          </p>
        </div>

        {/* Search Card */}
        <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-5 sm:p-8 shadow-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_auto]">
              <div>
                <label
                  htmlFor="order-id"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/75"
                >
                  Order ID / Reference *
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="order-id"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. DAL-20260925-ABCD"
                    className="h-12 w-full rounded-md border border-ink/20 px-4 text-sm font-mono uppercase tracking-wide placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/35 focus:border-chestnut focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="order-contact"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/75"
                >
                  Phone or Email (Optional)
                </label>
                <input
                  id="order-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="mt-1.5 h-12 w-full rounded-md border border-ink/20 px-4 text-sm placeholder:text-ink/35 focus:border-chestnut focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="h-12 w-full sm:w-auto bg-black text-white px-8 text-xs font-semibold tracking-widest uppercase hover:bg-neutral-800 shadow-sm flex items-center justify-center gap-2"
                >
                  <SearchIcon width={15} height={15} />
                  <span>{loading ? 'Searching…' : 'Track'}</span>
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                <AlertCircleIcon width={16} height={16} className="mt-0.5 shrink-0 text-red-600" />
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Order Details Result */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Status Banner */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-xl font-bold text-ink">
                      {order.order_number}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderNumber}
                      className="inline-flex items-center gap-1 rounded bg-cream/70 px-2 py-1 text-[11px] font-medium text-ink/70 hover:text-ink border border-ink/10"
                      title="Copy Reference"
                    >
                      {copied ? (
                        <>
                          <CheckIcon width={12} height={12} className="text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon width={12} height={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold capitalize ${
                      statusBadgeStyles[order.status] || 'bg-cream text-ink border-ink/20'
                    }`}
                  >
                    {order.status_display}
                  </span>
                </div>
              </div>

              {/* Visual Progress Timeline (hidden if cancelled) */}
              {!isCancelled ? (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-6">
                    Fulfillment Progress
                  </p>
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-ink/10 -z-0 hidden sm:block" />

                    <div className="grid gap-6 sm:grid-cols-5 sm:gap-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div
                            key={step.key}
                            className="flex sm:flex-col items-start sm:items-center sm:text-center gap-3 sm:gap-2 relative z-10"
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                                isDone
                                  ? 'bg-emerald-700 text-white shadow-xs'
                                  : 'bg-white border-2 border-ink/20 text-ink/40'
                              } ${isCurrent ? 'ring-4 ring-gold/30' : ''}`}
                            >
                              {isDone ? (
                                <CheckIcon width={14} height={14} strokeWidth={2.5} />
                              ) : (
                                idx + 1
                              )}
                            </span>
                            <div>
                              <p
                                className={`text-xs font-semibold ${
                                  isDone ? 'text-ink' : 'text-ink/40'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[11px] text-ink/50 sm:hidden">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg bg-red-50 p-4 text-xs text-red-800 border border-red-200">
                  <p className="font-semibold">Order {order.status_display}</p>
                  <p className="mt-0.5">
                    This order has been marked as {order.status_display.toLowerCase()}. If you have any inquiries regarding refunds or replacements, please contact our support desk below.
                  </p>
                </div>
              )}
            </div>

            {/* Order Items & Breakdown */}
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* Item List */}
              <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-xs">
                <h2 className="font-serif text-lg text-ink">Ordered Items</h2>
                <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                  {order.items.map((item) => {
                    const itemImage = resolveOrderItemImage(item);
                    return (
                      <li key={item.id} className="flex gap-4 py-4 items-center">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={item.product_name}
                            className="h-20 w-16 rounded-lg object-cover shrink-0 border border-ink/10 shadow-2xs"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (products[0]?.images?.[0] && target.src !== products[0].images[0]) {
                                target.src = products[0].images[0];
                              }
                            }}
                          />
                        ) : (
                          <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-cream text-chestnut shrink-0 border border-ink/10">
                            <PackageIcon width={24} height={24} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-sm sm:text-base font-medium text-ink">
                            {item.product_name}
                          </p>
                          <p className="mt-0.5 text-xs text-ink/60">
                            {[
                              item.selected_length ? `${item.selected_length} in` : null,
                              item.selected_size ? `Size: ${item.selected_size}` : null,
                              item.selected_color ? `Colour: ${item.selected_color}` : null,
                              item.selected_cap_type || null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                          <p className="text-xs text-ink/50 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-serif text-sm sm:text-base font-semibold text-ink shrink-0">
                          {formatKsh(parseFloat(item.total_price))}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Totals */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-ink/70">
                    <span>Subtotal</span>
                    <span>{formatKsh(parseFloat(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-ink/70">
                    <span>Delivery ({order.delivery_method})</span>
                    <span>
                      {parseFloat(order.delivery_fee) === 0
                        ? 'Free'
                        : formatKsh(parseFloat(order.delivery_fee))}
                    </span>
                  </div>
                  {parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-chestnut">
                      <span>Discount ({order.discount_code})</span>
                      <span>− {formatKsh(parseFloat(order.discount_amount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-ink/10 pt-3 text-sm font-bold text-ink">
                    <span>Total Paid / Due</span>
                    <span className="font-serif text-lg text-chestnut">
                      {formatKsh(parseFloat(order.total_amount))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery & Customer Details */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-xs">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/75">
                    <TruckIcon width={15} height={15} className="text-chestnut" />
                    <span>Shipping &amp; Delivery</span>
                  </h3>
                  <div className="mt-4 space-y-2 text-xs text-ink/70">
                    <p>
                      <strong className="text-ink">Recipient:</strong> {order.customer_name}
                    </p>
                    <p>
                      <strong className="text-ink">Phone:</strong> {order.customer_phone}
                    </p>
                    <p>
                      <strong className="text-ink">Email:</strong> {order.customer_email}
                    </p>
                    <p>
                      <strong className="text-ink">Method:</strong> {order.delivery_method}
                    </p>
                    <p>
                      <strong className="text-ink">Address:</strong> {order.delivery_address}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-xs">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/75">
                    <ShieldCheckIcon width={15} height={15} className="text-chestnut" />
                    <span>Payment Status</span>
                  </h3>
                  <div className="mt-4 space-y-2 text-xs text-ink/70">
                    <p>
                      <strong className="text-ink">Method:</strong> {order.payment_method_display}
                    </p>
                    <p>
                      <strong className="text-ink">Status:</strong>{' '}
                      <span className="font-semibold text-ink">{order.payment_status_display}</span>
                    </p>
                  </div>

                  <div className="mt-5 border-t border-ink/10 pt-4">
                    <p className="text-[11px] text-ink/60 leading-relaxed">
                      Questions regarding your order delivery? Reach our dedicated concierge directly.
                    </p>
                    <a
                      href="https://wa.me/254700000000?text=Hi%20Dallian,%20I%20am%20tracking%20my%20order%20"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                    >
                      <PhoneCallIcon width={14} height={14} />
                      WhatsApp Customer Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5]/80 py-20 text-center">
          <div className="mx-auto max-w-sm animate-pulse space-y-4 px-4">
            <div className="mx-auto h-8 w-44 rounded bg-ink/10" />
            <div className="mx-auto h-4 w-60 rounded bg-ink/5" />
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </React.Suspense>
  );
}
