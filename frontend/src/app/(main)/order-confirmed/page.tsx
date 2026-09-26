'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2Icon, CopyIcon, CheckIcon, PackageIcon, PhoneIcon, TruckIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { formatKsh } from '@/utils/format';

export default function OrderConfirmedPage() {
  const { lastOrder, user } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (lastOrder?.id) {
      navigator.clipboard.writeText(lastOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!lastOrder) {
    return (
      <main className="mx-auto max-w-page px-5 py-20 text-center sm:px-8">
        <PackageIcon className="mx-auto h-12 w-12 text-ink/30" />
        <h1 className="mt-4 font-serif text-3xl text-ink">No Recent Order Found</h1>
        <p className="mt-2 text-sm text-ink/60">
          Looks like you haven&apos;t placed an order in this session yet.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block bg-black px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            Explore Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#FAF8F5]/80 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        {/* Success Header */}
        <div className="rounded-xl border border-ink/10 bg-white p-6 text-center shadow-xs sm:p-10">
          <CheckCircle2Icon className="mx-auto h-14 w-14 sm:h-16 sm:w-16 text-emerald-600" />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-chestnut">
            Order Confirmed
          </p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-4xl">
            Thank You, {lastOrder.customer.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-ink/65">
            Your order has been recorded in our system.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-ink/10 bg-cream/70 px-4 py-2 text-xs sm:text-sm font-semibold text-ink">
            <span className="text-ink/60">Order Reference:</span>
            <span className="font-mono text-chestnut">{lastOrder.id}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="ml-1 inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[11px] font-normal text-ink/70 hover:text-ink border border-ink/10 shadow-2xs"
              title="Copy Order Number"
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

          <p className="mt-4 text-xs text-ink/55 max-w-md mx-auto">
            A confirmation receipt has been sent to <strong>{lastOrder.email}</strong> and SMS updates will be sent to <strong>{lastOrder.phone}</strong>.
          </p>
        </div>

        {/* Order Details & Summary Card */}
        <div className="mt-8 rounded-xl border border-ink/10 bg-white p-6 shadow-xs sm:p-8">
          <h2 className="font-serif text-xl text-ink">Order Summary</h2>

          {/* Items */}
          <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {lastOrder.items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-4 py-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-stone-100 text-stone-400">
                    <PackageIcon width={24} height={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base text-ink line-clamp-1">{item.name}</h3>
                  {item.options && (
                    <p className="text-xs text-ink/55">{item.options}</p>
                  )}
                  <p className="text-xs text-ink/65">Qty: {item.quantity}</p>
                </div>
                <p className="font-serif text-sm font-medium text-ink">
                  {formatKsh(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          {/* Delivery & Payment Details */}
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-cream/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/75">
                <TruckIcon width={14} height={14} className="text-chestnut" />
                <span>Delivery Details</span>
              </div>
              <p className="mt-2 font-medium text-ink">{lastOrder.delivery.method}</p>
              <p className="mt-1 text-xs text-ink/65 leading-relaxed">
                {lastOrder.delivery.address}
              </p>
              <p className="mt-2 text-xs text-ink/70">
                Fee: {lastOrder.delivery.fee > 0 ? formatKsh(lastOrder.delivery.fee) : 'Free Collection'}
              </p>
            </div>

            <div className="rounded-lg bg-cream/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/75">
                <PhoneIcon width={14} height={14} className="text-chestnut" />
                <span>Payment &amp; Support</span>
              </div>
              <p className="mt-2 font-medium text-ink">Method: {lastOrder.paymentMethod}</p>
              <p className="mt-1 text-xs text-ink/65">
                Status:{' '}
                <span className="font-semibold text-amber-800">
                  {lastOrder.paymentStatus}
                </span>
              </p>
              <p className="mt-2 text-xs text-ink/65 leading-relaxed">
                Need help? Call or WhatsApp us directly at <strong>+254 700 000 000</strong>.
              </p>
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="mt-6 border-t border-ink/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Delivery Fee</span>
              <span>{formatKsh(lastOrder.delivery.fee)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-serif text-lg font-bold text-ink">
              <span>Total Amount</span>
              <span className="text-chestnut">{formatKsh(lastOrder.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-ink/10 pt-6">
            <Link
              href={user ? '/customer/dashboard' : `/track?id=${encodeURIComponent(lastOrder.id)}`}
              className="text-center text-xs uppercase tracking-wider text-ink/65 underline underline-offset-4 hover:text-ink py-2"
            >
              {user ? 'View in Customer Dashboard' : 'Track Status with Order Number'}
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
