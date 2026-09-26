'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2Icon,
  CopyIcon,
  CheckIcon,
  PackageIcon,
  PhoneIcon,
  TruckIcon,
  CreditCardIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
} from 'lucide-react';
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream">
          <PackageIcon className="h-8 w-8 text-ink/30" />
        </div>
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

  const firstName = lastOrder.customer ? lastOrder.customer.split(' ')[0] : 'Valued Client';
  const subtotal = lastOrder.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <main className="min-h-[80vh] bg-[#FAF8F5]/80 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Unified Single Order Card Section */}
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
          {/* Top Luxury Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B3A2A] via-[#D99B26] to-[#8B3A2A]" />

          {/* Unified Order Confirmation Header */}
          <div className="border-b border-ink/10 bg-[#FAF7F2]/60 px-5 py-6 text-center sm:px-8 sm:py-8">
            <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-600 shadow-2xs">
              <CheckCircle2Icon className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-[#8B3A2A]">
              Order Confirmed &amp; Received
            </p>

            <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
              Thank You, {firstName}!
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-ink/65 max-w-lg mx-auto">
              Your order has been recorded. A confirmation receipt has been sent to{' '}
              <strong className="text-ink">{lastOrder.email}</strong>.
            </p>

            {/* Order Reference Pill */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink/12 bg-white px-4 py-1.5 text-xs shadow-2xs">
              <span className="text-ink/50 font-medium">Order Reference:</span>
              <span className="font-mono font-bold tracking-wider text-[#8B3A2A]">{lastOrder.id}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="ml-1 inline-flex items-center gap-1 rounded bg-cream/70 px-2 py-0.5 text-[11px] font-medium text-ink/70 hover:text-ink border border-ink/10 transition"
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
          </div>

          {/* Unified Order Body (2-column layout on medium/large screens) */}
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
            
            {/* Left Column: Items Ordered */}
            <div>
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <h2 className="flex items-center gap-2 font-serif text-base sm:text-lg text-ink font-semibold">
                  <ShoppingBagIcon width={16} height={16} className="text-[#8B3A2A]" />
                  <span>Items Ordered ({lastOrder.items.length})</span>
                </h2>
                <span className="text-xs text-ink/45">{lastOrder.placedAt}</span>
              </div>

              <ul className="divide-y divide-ink/8">
                {lastOrder.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3.5 py-3.5">
                    {item.image ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-ink/5">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-cream text-ink/30 border border-ink/10">
                        <PackageIcon width={22} height={22} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-sm font-semibold text-ink line-clamp-1">
                        {item.name}
                      </h3>
                      {item.options && (
                        <p className="mt-0.5 text-xs text-ink/60 line-clamp-1">{item.options}</p>
                      )}
                      <p className="mt-1 text-xs text-ink/50">
                        Qty {item.quantity} × {formatKsh(item.price)}
                      </p>
                    </div>

                    <p className="shrink-0 font-serif text-sm font-bold text-ink">
                      {formatKsh(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Delivery, Payment & Financial Summary */}
            <div className="flex flex-col justify-between space-y-5 rounded-xl border border-ink/10 bg-[#FAF8F5]/60 p-4 sm:p-5">
              <div className="space-y-4">
                {/* Shipping & Delivery Brief */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#8B3A2A]">
                    <TruckIcon width={13} height={13} />
                    <span>Delivery Details</span>
                  </div>
                  <p className="font-semibold text-ink text-sm">{lastOrder.delivery.method}</p>
                  <p className="text-ink/65 leading-snug">{lastOrder.delivery.address}</p>
                </div>

                {/* Payment Brief */}
                <div className="space-y-1 border-t border-ink/10 pt-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#8B3A2A]">
                    <CreditCardIcon width={13} height={13} />
                    <span>Payment &amp; Status</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink/70">{lastOrder.paymentMethod}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                      {lastOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-1.5 border-t border-ink/10 pt-3 text-xs">
                  <div className="flex justify-between text-ink/65">
                    <span>Subtotal</span>
                    <span>{formatKsh(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-ink/65">
                    <span>Delivery Fee</span>
                    <span>{lastOrder.delivery.fee > 0 ? formatKsh(lastOrder.delivery.fee) : 'Free'}</span>
                  </div>
                  <div className="flex justify-between border-t border-ink/10 pt-2 text-sm font-bold text-ink">
                    <span>Total Amount</span>
                    <span className="font-serif text-base text-[#8B3A2A]">
                      {formatKsh(lastOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees Note */}
              <div className="rounded-lg bg-white p-2.5 text-[11px] text-ink/60 border border-ink/8 flex items-center gap-2">
                <ShieldCheckIcon width={16} height={16} className="text-[#8B3A2A] shrink-0" />
                <span>Our concierge will contact you shortly to confirm dispatch.</span>
              </div>
            </div>

          </div>

          {/* Unified Bottom Actions Bar */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-ink/10 bg-[#FAF7F2]/40 px-5 py-4 sm:px-8">
            <Link
              href={user ? '/customer/dashboard' : `/track?id=${encodeURIComponent(lastOrder.id)}`}
              className="text-center sm:text-left text-xs uppercase tracking-wider text-ink/65 underline underline-offset-4 hover:text-[#8B3A2A] py-1.5 font-medium transition"
            >
              {user ? '← Customer Dashboard' : '← Track Status with Order Number'}
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 bg-black px-6 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800 rounded-lg shadow-xs"
            >
              <span>Continue Shopping</span>
              <ArrowRightIcon width={13} height={13} />
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
