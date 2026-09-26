'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SearchIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  XIcon,
  CheckCircleIcon,
  PackageIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  StickyNoteIcon,
  UserIcon,
} from 'lucide-react';
import {
  adminFetchOrders,
  adminFetchOrderDetail,
  adminUpdateOrder,
  BackendOrderListItem,
  BackendOrderDetail,
} from '@/utils/api';
import { cx } from '@/utils/format';

/* ── constants ───────────────────────────────────────────────────── */

const ORDER_STATUSES = [
  { value: '',                   label: 'All Statuses' },
  { value: 'pending',            label: 'Pending' },
  { value: 'payment_confirmed',  label: 'Payment Confirmed' },
  { value: 'processing',         label: 'Preparing' },
  { value: 'ready_for_delivery', label: 'Ready for Delivery' },
  { value: 'out_for_delivery',   label: 'Out for Delivery' },
  { value: 'delivered',          label: 'Delivered' },
  { value: 'cancelled',          label: 'Cancelled' },
];

const PAYMENT_STATUSES = [
  { value: '',                 label: 'All Payments' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'paid',             label: 'Paid' },
  { value: 'failed',           label: 'Failed' },
  { value: 'refunded',         label: 'Refunded' },
];

const STATUS_BADGE: Record<string, string> = {
  pending:              'bg-amber-50 text-amber-700 border-amber-200',
  payment_confirmed:    'bg-blue-50 text-blue-700 border-blue-200',
  processing:           'bg-purple-50 text-purple-700 border-purple-200',
  ready_for_delivery:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  out_for_delivery:     'bg-sky-50 text-sky-700 border-sky-200',
  delivered:            'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:            'bg-red-50 text-red-700 border-red-200',
  awaiting_payment:     'bg-amber-50 text-amber-700 border-amber-200',
  paid:                 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed:               'bg-red-50 text-red-700 border-red-200',
  refunded:             'bg-rose-50 text-rose-700 border-rose-200',
};

function Badge({ value, display }: { value: string; display: string }) {
  return (
    <span className={cx(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
      STATUS_BADGE[value] ?? 'bg-ink/5 text-ink/60 border-ink/10'
    )}>
      {display}
    </span>
  );
}

/* ── ORDER DETAIL MODAL ──────────────────────────────────────────── */

function OrderModal({
  orderId,
  onClose,
}: {
  orderId: number;
  onClose: () => void;
}) {
  const [detail, setDetail]   = useState<BackendOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // update form state
  const [status,    setStatus]    = useState('');
  const [payStatus, setPayStatus] = useState('');
  const [payRef,    setPayRef]    = useState('');
  const [notes,     setNotes]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveErr,   setSaveErr]   = useState('');

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    setLoading(true);
    adminFetchOrderDetail(orderId)
      .then((d) => {
        setDetail(d);
        setStatus(d.status);
        setPayStatus(d.payment_status);
        setPayRef(d.payment_reference ?? '');
        setNotes(d.staff_notes ?? '');
      })
      .catch(() => setError("Couldn't load order details."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    setSaveErr('');
    setSaved(false);
    try {
      const updated = await adminUpdateOrder(detail.id, {
        status,
        payment_status: payStatus,
        payment_reference: payRef,
        staff_notes: notes,
      });
      // PATCH returns only the updatable fields — merge them into the full detail
      // so items, customer info, etc. (not returned by PATCH) are preserved.
      setDetail((prev) => prev ? { ...prev, ...updated } : updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveErr('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const subtotal    = parseFloat(detail?.subtotal        || '0');
  const deliveryFee = parseFloat(detail?.delivery_fee    || '0');
  const discount    = parseFloat(detail?.discount_amount || '0');
  const total       = parseFloat(detail?.total_amount    || '0');

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* dim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />

      {/* panel */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl max-h-[92vh]">

        {/* modal header */}
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-5 py-4">
          <div>
            <p className="font-mono text-sm font-bold tracking-wider text-ink">
              {detail?.order_number ?? '…'}
            </p>
            {detail && (
              <p className="mt-0.5 text-xs text-ink/40">
                {new Date(detail.created_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/8 hover:text-ink"
          >
            <XIcon width={17} height={17} />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {loading && (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded-lg bg-ink/5" />)}
            </div>
          )}

          {!loading && error && (
            <p className="p-5 text-sm text-red-600">{error}</p>
          )}

          {!loading && detail && (
            <div className="divide-y divide-ink/8">

              {/* ── customer details ── */}
              <section className="px-5 py-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/35">
                  Customer Details
                </p>
                <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <UserIcon width={14} height={14} className="mt-0.5 shrink-0 text-ink/30" />
                    <span className="font-medium text-ink">{detail.customer_name || '—'}</span>
                  </div>
                  {detail.customer_email && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-[11px] text-ink/30">@</span>
                      <span className="break-all text-ink/65">{detail.customer_email}</span>
                    </div>
                  )}
                  {detail.customer_phone && (
                    <div className="flex items-start gap-2">
                      <PhoneIcon width={14} height={14} className="mt-0.5 shrink-0 text-ink/30" />
                      <span className="text-ink/65">{detail.customer_phone}</span>
                    </div>
                  )}
                  {detail.delivery_address && (
                    <div className="flex items-start gap-2">
                      <MapPinIcon width={14} height={14} className="mt-0.5 shrink-0 text-ink/30" />
                      <span className="text-ink/65 leading-snug">
                        {detail.delivery_address}{detail.delivery_city ? `, ${detail.delivery_city}` : ''}
                      </span>
                    </div>
                  )}
                  {detail.customer_notes && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <StickyNoteIcon width={14} height={14} className="mt-0.5 shrink-0 text-amber-500" />
                      <span className="italic text-amber-700">{detail.customer_notes}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* ── items ── */}
              <section className="px-5 py-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/35">
                  Items Ordered
                </p>
                <ul className="space-y-3">
                  {(detail.items ?? []).map(item => (
                    <li key={item.id} className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                        {item.product_image
                          ? <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <div className="flex h-full w-full items-center justify-center"><PackageIcon width={16} height={16} className="text-ink/20" /></div>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink line-clamp-1">{item.product_name}</p>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {item.selected_size     && <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/50">Size {item.selected_size}</span>}
                          {item.selected_color    && <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/50">{item.selected_color}</span>}
                          {item.selected_length   && <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/50">{item.selected_length}&quot;</span>}
                          {item.selected_cap_type && <span className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/50">{item.selected_cap_type}</span>}
                        </div>
                        <p className="mt-1 text-xs text-ink/40">Qty {item.quantity} × KSh {Number(item.unit_price).toLocaleString()}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-ink">
                        KSh {Number(item.total_price).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* totals */}
                <div className="mt-4 space-y-1 border-t border-ink/8 pt-3 text-sm">
                  <div className="flex justify-between text-ink/50">
                    <span>Subtotal</span><span>KSh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-ink/50">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? <span className="text-emerald-600">Free</span> : `KSh ${deliveryFee.toLocaleString()}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span><span>− KSh {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold text-ink">
                    <span>Total</span><span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>
              </section>

              {/* ── payment info ── */}
              <section className="px-5 py-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/35">
                  Payment
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon width={14} height={14} className="text-ink/30" />
                    <span className="text-ink/65">{detail.payment_method_display || '—'}</span>
                  </div>
                  <div>
                    <Badge value={detail.payment_status} display={detail.payment_status_display} />
                  </div>
                  {detail.payment_reference && (
                    <div className="font-mono text-xs text-ink/55">Ref: {detail.payment_reference}</div>
                  )}
                </div>
              </section>

              {/* ── update order ── */}
              <section className="bg-[#FAF8F5] px-5 py-4">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B3A2A]/60">
                  Update Order
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* order status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-ink/50">Order Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-[#8B3A2A] focus:outline-none"
                    >
                      {ORDER_STATUSES.filter(s => s.value).map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* payment status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-ink/50">Payment Status</label>
                    <select
                      value={payStatus}
                      onChange={e => setPayStatus(e.target.value)}
                      className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-[#8B3A2A] focus:outline-none"
                    >
                      {PAYMENT_STATUSES.filter(s => s.value).map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* payment reference */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-ink/50">Payment Reference</label>
                    <input
                      type="text"
                      value={payRef}
                      onChange={e => setPayRef(e.target.value)}
                      placeholder="e.g. M-Pesa code"
                      className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-[#8B3A2A] focus:outline-none"
                    />
                  </div>

                  {/* staff notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-ink/50">Staff Notes</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Internal note…"
                      className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-[#8B3A2A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* save */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus(detail.status);
                      setPayStatus(detail.payment_status);
                      setPayRef(detail.payment_reference ?? '');
                      setNotes(detail.staff_notes ?? '');
                      setSaveErr('');
                      setSaved(false);
                    }}
                    disabled={saving}
                    className="rounded-lg border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/60 transition hover:border-ink/30 hover:text-ink disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-[#8B3A2A] px-5 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
                  >
                    {saving && <RefreshCwIcon width={14} height={14} className="animate-spin" />}
                    {saved  && <CheckCircleIcon width={14} height={14} />}
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                  </button>
                  {saveErr && <p className="text-sm text-red-600">{saveErr}</p>}
                </div>
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── TABLE ROW ───────────────────────────────────────────────────── */

function OrderRow({ order, onOpen }: { order: BackendOrderListItem; onOpen: () => void }) {
  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const time = new Date(order.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <tr className="group border-b border-ink/8 transition hover:bg-[#FDFBF8]">
      {/* ORDER */}
      <td className="px-4 py-3.5 sm:px-5">
        <p className="font-mono text-xs font-bold tracking-wider text-ink">{order.order_number}</p>
        <p className="mt-0.5 text-[10px] text-ink/40">{time}</p>
      </td>

      {/* CUSTOMER */}
      <td className="px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold text-ink leading-snug">{order.customer_name}</p>
        <p className="mt-0.5 text-[10px] text-ink/40">
          {order.is_guest ? 'Guest order' : 'Member'}
        </p>
      </td>

      {/* ITEMS */}
      <td className="hidden px-4 py-3.5 sm:px-5 md:table-cell">
        <p className="text-sm text-ink">{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</p>
        <p className="mt-0.5 text-[10px] text-ink/40">{order.delivery_method || 'Delivery'}</p>
      </td>

      {/* TOTAL */}
      <td className="px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold text-ink">KSh {Number(order.total_amount).toLocaleString()}</p>
      </td>

      {/* STATUS */}
      <td className="px-4 py-3.5 sm:px-5">
        <Badge value={order.status} display={order.status_display} />
      </td>

      {/* DATE */}
      <td className="hidden px-4 py-3.5 sm:px-5 lg:table-cell">
        <p className="text-xs text-ink/55 whitespace-nowrap">{date}</p>
      </td>

      {/* ARROW */}
      <td className="px-4 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={onOpen}
          aria-label="View order details"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink/35 transition hover:bg-ink/8 hover:text-ink group-hover:text-ink/60"
        >
          <ChevronRightIcon width={16} height={16} />
        </button>
      </td>
    </tr>
  );
}

/* ── PAGE ────────────────────────────────────────────────────────── */

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState<BackendOrderListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter]       = useState('');
  const [openId, setOpenId]     = useState<number | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (q: string, st: string, pt: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminFetchOrders({
        q:              q  || undefined,
        status:         st || undefined,
        payment_status: pt || undefined,
      });
      setOrders(data);
    } catch {
      setError("Couldn't load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load('', '', ''); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(val, statusFilter, payFilter), 350);
  };

  const applyFilter = (st: string, pt: string) => {
    setStatusFilter(st);
    setPayFilter(pt);
    load(search, st, pt);
  };

  return (
    <div className="w-full space-y-5">

      {/* page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-luxe text-[#8B3A2A]">Admin</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-ink/45">
            {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(search, statusFilter, payFilter)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-xs text-ink/55 transition hover:border-ink/30 hover:text-ink disabled:opacity-40"
        >
          <RefreshCwIcon width={13} height={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon width={14} height={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search order #, name, phone, email…"
            className="w-full rounded-lg border border-ink/15 bg-white py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink/30 focus:border-[#8B3A2A] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => applyFilter(e.target.value, payFilter)}
          className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-[#8B3A2A] focus:outline-none"
        >
          {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={payFilter}
          onChange={e => applyFilter(statusFilter, e.target.value)}
          className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-[#8B3A2A] focus:outline-none"
        >
          {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* loading */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-ink/5" />)}
        </div>
      )}

      {/* error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      )}

      {/* empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink/15 bg-white py-16 text-center">
          <PackageIcon width={36} height={36} className="text-ink/20" />
          <p className="text-sm text-ink/45">No orders found. Try adjusting your filters.</p>
        </div>
      )}

      {/* table */}
      {!loading && !error && orders.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left">
              <thead>
                <tr className="border-b border-ink/10 bg-[#FAF8F5]">
                  {['ORDER', 'CUSTOMER', 'ITEMS', 'TOTAL', 'STATUS', 'DATE', ''].map((h, i) => (
                    <th
                      key={i}
                      className={cx(
                        'px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-[#8B3A2A] sm:px-5',
                        h === 'ITEMS' && 'hidden md:table-cell',
                        h === 'DATE'  && 'hidden lg:table-cell',
                        h === ''      && 'w-12'
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onOpen={() => setOpenId(order.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* modal */}
      {openId !== null && (
        <OrderModal orderId={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
