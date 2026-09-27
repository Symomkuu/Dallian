'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNavigate } from '@/components/RouterCompat';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CreditCardIcon,
  InfoIcon,
  LockIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  StoreIcon,
  TruckIcon,
  UserCheckIcon,
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatKsh } from '@/utils/format';
import { createOrder } from '@/utils/api';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';

const STEPS = [
  { id: 'customer', title: 'Details', fullTitle: 'Customer Information' },
  { id: 'delivery', title: 'Delivery', fullTitle: 'Delivery Option' },
  { id: 'payment', title: 'Payment', fullTitle: 'Payment & Review' },
];

const deliveryOptions = [
  {
    id: 'collection',
    label: 'Store Collection',
    detail: 'Mountain Mall, Thika Road, Nairobi',
    badge: 'Pick up in store',
    fee: 0,
    icon: StoreIcon,
  },
  {
    id: 'nairobi',
    label: 'Nairobi Delivery',
    detail: 'Doorstep dispatch within Nairobi',
    badge: 'Same / Next Day',
    fee: 500,
    icon: TruckIcon,
  },
  {
    id: 'countrywide',
    label: 'Countrywide Courier',
    detail: 'SpeedAF, Fargo Courier, or Easy Coach to your town',
    badge: '1 - 3 Days',
    fee: 700,
    icon: TruckIcon,
  },
];

const paymentOptions = [
  {
    id: 'mpesa',
    label: 'M-Pesa (Buy Goods / Till)',
    detail: 'Instant payment instructions will be presented upon placing your order.',
    icon: SmartphoneIcon,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    detail: 'Processed securely via our verified payment gateway.',
    icon: CreditCardIcon,
  },
];

export default function CheckoutPage() {
  const { activeCart, subtotal, discount, placeOrder, user } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: user?.full_name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    address: user?.delivery_address ?? '',
    city: 'Nairobi',
    notes: '',
  });

  const [delivery, setDelivery] = useState(deliveryOptions[1]);
  const [payment, setPayment] = useState(paymentOptions[0]);

  // Scroll to top when changing steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const discountAmount = discount ? Math.round(subtotal * discount.amount) : 0;
  const total = subtotal + delivery.fee - discountAmount;

  const validateStep = (targetStep = step) => {
    const next: Record<string, string> = {};
    if (targetStep === 0) {
      if (!form.name.trim()) next.name = 'Please enter your full name.';
      const cleanPhone = form.phone.replace(/[\s\-\+]/g, '');
      if (!cleanPhone || cleanPhone.length < 9) {
        next.phone = 'Please enter a valid phone number (e.g. 0712345678).';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        next.email = 'Please enter a valid email address.';
      }
    }
    if (targetStep === 1) {
      if (delivery.id !== 'collection' && !form.address.trim()) {
        next.address = 'Please provide your delivery address or building name.';
      }
      if (delivery.id !== 'collection' && !form.city.trim()) {
        next.city = 'Please enter your town or city.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      setStep(0);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const payloadPaymentMethod = payment.id === 'card' ? 'card' : 'mpesa';
      const orderRes = await createOrder({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        delivery_method: delivery.label,
        address:
          delivery.id === 'collection'
            ? delivery.detail
            : `${form.address}, ${form.city}`.trim(),
        city: form.city.trim() || 'Nairobi',
        delivery_fee: delivery.fee,
        payment_method: payloadPaymentMethod,
        notes: form.notes.trim(),
        discount_code: discount?.code,
        items: activeCart.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          length: item.length,
          cap_type: item.capType,
          price: item.price,
        })),
      });

      placeOrder({
        id: orderRes.order_number,
        customer: orderRes.customer_name,
        phone: orderRes.customer_phone,
        email: orderRes.customer_email,
        placedAt: orderRes.created_at.slice(0, 10),
        total: parseFloat(orderRes.total_amount),
        status: 'Pending',
        paymentMethod: orderRes.payment_method_display,
        paymentStatus: 'Awaiting Payment',
        items: orderRes.items.map((it) => ({
          name: it.product_name,
          image: it.product_image,
          options: [
            it.selected_size
              ? `Size: ${it.selected_size}`
              : it.selected_length
                ? `${it.selected_length} in`
                : null,
            it.selected_color ? `Colour: ${it.selected_color}` : null,
            it.selected_cap_type || null,
          ]
            .filter(Boolean)
            .join(' · '),
          quantity: it.quantity,
          price: parseFloat(it.unit_price),
        })),
        delivery: {
          method: orderRes.delivery_method,
          address: orderRes.delivery_address,
          fee: parseFloat(orderRes.delivery_fee),
        },
      });

      navigate('/order-confirmed');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to complete your order right now. Please check your network and try again.';
      setErrors({
        form: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If bag is empty
  if (activeCart.length === 0) {
    return (
      <main className="mx-auto max-w-page px-5 py-16 text-center sm:px-8 lg:py-24">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream">
          <ShoppingBagIcon className="h-8 w-8 text-chestnut" />
        </div>
        <h1 className="mt-5 font-serif text-2xl text-ink sm:text-3xl">Your Shopping Bag is Empty</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
          You don&apos;t have any wigs or accessories selected for checkout yet.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-800"
          >
            Explore Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]/80 pb-20">
      {/* Mobile Collapsible Order Summary Bar */}
      <div className="border-b border-ink/10 bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((open) => !open)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm transition hover:bg-ink/[0.02]"
          aria-expanded={mobileSummaryOpen}
        >
          <div className="flex items-center gap-2 text-ink">
            <ShoppingBagIcon width={17} height={17} className="text-chestnut" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {mobileSummaryOpen ? 'Hide' : 'View'} Order Summary ({activeCart.length})
            </span>
            {mobileSummaryOpen ? (
              <ChevronUpIcon width={16} height={16} className="text-ink/50" />
            ) : (
              <ChevronDownIcon width={16} height={16} className="text-ink/50" />
            )}
          </div>
          <span className="font-serif text-base font-semibold text-ink">
            {formatKsh(total)}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div className="border-t border-ink/10 bg-cream/40 px-5 py-4">
            <ul className="divide-y divide-ink/10">
              {activeCart.map((item) => (
                <li key={item.key} className="flex items-center gap-3.5 py-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={64}
                    className="h-16 w-14 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink/55">
                      {item.length ? `${item.length} in` : ''}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                    <p className="text-[11px] text-ink/50">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-ink">
                    {formatKsh(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-ink/10 pt-3 text-xs">
              <div className="flex justify-between text-ink/70">
                <span>Subtotal</span>
                <span>{formatKsh(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>{delivery.label}</span>
                <span>{delivery.fee === 0 ? 'Free' : formatKsh(delivery.fee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-chestnut">
                  <span>Discount ({discount?.code})</span>
                  <span>− {formatKsh(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-2 text-sm font-semibold text-ink">
                <span>Total</span>
                <span className="font-serif text-base text-chestnut">{formatKsh(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-page px-4 pt-6 sm:px-8 lg:pt-12">
        {/* Step Progress Tracker */}
        <nav aria-label="Checkout steps" className="mb-8">
          <ol className="flex items-center justify-between rounded-xl border border-ink/10 bg-white p-3 shadow-xs sm:px-8 sm:py-4">
            {STEPS.map((s, idx) => {
              const isDone = idx < step;
              const isCurrent = idx === step;
              const isUpcoming = idx > step;

              return (
                <li
                  key={s.id}
                  className="flex flex-1 items-center last:flex-none"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isDone) setStep(idx);
                    }}
                    disabled={isUpcoming}
                    className={cx(
                      'group flex items-center gap-2 sm:gap-3 text-left transition',
                      isDone ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    )}
                  >
                    <span
                      className={cx(
                        'flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition',
                        isDone && 'bg-emerald-700 text-white',
                        isCurrent && 'bg-ink text-white ring-2 ring-gold/40',
                        isUpcoming && 'border border-ink/20 text-ink/40 bg-white'
                      )}
                    >
                      {isDone ? <CheckIcon width={14} height={14} strokeWidth={2.5} /> : idx + 1}
                    </span>

                    <div className="hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wider text-ink/45">
                        Step {idx + 1}
                      </p>
                      <p
                        className={cx(
                          'text-xs font-semibold sm:text-sm',
                          isCurrent ? 'text-ink' : isDone ? 'text-ink/80' : 'text-ink/40'
                        )}
                      >
                        {s.fullTitle}
                      </p>
                    </div>

                    <div className="sm:hidden">
                      <p
                        className={cx(
                          'text-xs font-semibold',
                          isCurrent ? 'text-ink' : isDone ? 'text-ink/80' : 'text-ink/40'
                        )}
                      >
                        {s.title}
                      </p>
                    </div>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div
                      className={cx(
                        'mx-2 sm:mx-6 h-0.5 flex-1 transition-colors',
                        idx < step ? 'bg-emerald-600/60' : 'bg-ink/10'
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Global Error Banner */}
        {errors.form && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <InfoIcon width={18} height={18} className="mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">Unable to proceed</p>
              <p className="mt-0.5 text-xs text-red-700">{errors.form}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12 items-start">
          {/* Main Step Content */}
          <section aria-label={STEPS[step].fullTitle} className="space-y-6">
            {/* Step 0: Customer Information */}
            {step === 0 && (
              <div className="rounded-xl border border-ink/10 bg-white p-5 sm:p-8 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-5">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl text-ink">Customer Information</h2>
                    <p className="mt-1 text-xs sm:text-sm text-ink/60">
                      Who should we contact regarding this order and delivery?
                    </p>
                  </div>

                  {user ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                      <UserCheckIcon width={13} height={13} />
                      Logged in as {user.full_name?.split(' ')[0] || user.email}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-ink/75">
                      <ShieldCheckIcon width={13} height={13} className="text-chestnut" />
                      Guest Checkout
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Full Name *"
                    placeholder="e.g. Amina Wanjiru"
                    value={form.name}
                    error={errors.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="sm:col-span-2"
                    autoComplete="name"
                  />
                  <TextField
                    label="Phone Number (SMS Updates) *"
                    placeholder="e.g. 0712 345 678"
                    value={form.phone}
                    error={errors.phone}
                    hint="For M-Pesa prompts and rider updates"
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  <TextField
                    label="Email Address (Receipt & Tracking) *"
                    placeholder="e.g. amina@example.com"
                    type="email"
                    value={form.email}
                    error={errors.email}
                    hint="We send your order confirmation here"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Delivery Option & Address */}
            {step === 1 && (
              <div className="rounded-xl border border-ink/10 bg-white p-5 sm:p-8 shadow-xs">
                <div className="border-b border-ink/10 pb-5">
                  <h2 className="font-serif text-xl sm:text-2xl text-ink">Choose Delivery Method</h2>
                  <p className="mt-1 text-xs sm:text-sm text-ink/60">
                    Select how you would like to receive your Dallian Luxe Hair parcel.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {deliveryOptions.map((option) => {
                    const selected = delivery.id === option.id;
                    const Icon = option.icon;

                    return (
                      <label
                        key={option.id}
                        className={cx(
                          'flex cursor-pointer items-start gap-4 rounded-lg border p-4 sm:p-5 transition',
                          selected
                            ? 'border-chestnut bg-chestnut/[0.04] ring-1 ring-chestnut'
                            : 'border-ink/15 hover:border-ink/30 bg-white'
                        )}
                      >
                        <input
                          type="radio"
                          name="delivery_option"
                          checked={selected}
                          onChange={() => setDelivery(option)}
                          className="mt-1 h-4 w-4 text-chestnut focus:ring-chestnut"
                        />

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                          <Icon width={18} height={18} className="text-chestnut" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-ink">{option.label}</span>
                            <span className="rounded bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/65">
                              {option.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-ink/60">{option.detail}</p>
                        </div>

                        <div className="text-right">
                          <span className="font-serif text-sm font-semibold text-ink">
                            {option.fee === 0 ? 'Free' : formatKsh(option.fee)}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Delivery Address fields if not store collection */}
                {delivery.id !== 'collection' && (
                  <div className="mt-8 border-t border-ink/10 pt-6">
                    <h3 className="font-serif text-lg text-ink">Shipping Destination</h3>
                    <p className="mt-1 text-xs text-ink/55">
                      Provide detailed directions, estate/building name, and apartment or house number.
                    </p>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <TextField
                        label="Physical Delivery Address *"
                        placeholder="e.g. Kilimani, Argwings Kodhek Rd, Silvercreek Apts, House 4B"
                        value={form.address}
                        error={errors.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="sm:col-span-2"
                        autoComplete="street-address"
                      />
                      <TextField
                        label="Town / City *"
                        placeholder="e.g. Nairobi, Mombasa, Nakuru"
                        value={form.city}
                        error={errors.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      />
                      <TextField
                        label="Special Delivery Instructions (Optional)"
                        placeholder="e.g. Leave with security / Call upon arrival"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment & Review */}
            {step === 2 && (
              <div className="rounded-xl border border-ink/10 bg-white p-5 sm:p-8 shadow-xs">
                <div className="border-b border-ink/10 pb-5">
                  <h2 className="font-serif text-xl sm:text-2xl text-ink">Payment Method</h2>
                  <p className="mt-1 text-xs sm:text-sm text-ink/60">
                    Choose your preferred payment method.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {paymentOptions.map((option) => {
                    const selected = payment.id === option.id;
                    const Icon = option.icon;

                    return (
                      <label
                        key={option.id}
                        className={cx(
                          'flex cursor-pointer items-start gap-4 rounded-lg border p-4 sm:p-5 transition',
                          selected
                            ? 'border-chestnut bg-chestnut/[0.04] ring-1 ring-chestnut'
                            : 'border-ink/15 hover:border-ink/30 bg-white'
                        )}
                      >
                        <input
                          type="radio"
                          name="payment_option"
                          checked={selected}
                          onChange={() => setPayment(option)}
                          className="mt-1 h-4 w-4 text-chestnut focus:ring-chestnut"
                        />

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                          <Icon width={18} height={18} className="text-chestnut" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">{option.label}</span>
                          <span className="mt-1 block text-xs text-ink/60">{option.detail}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Verification Notice */}
                <div className="mt-6 rounded-lg bg-cream/60 p-4 border border-ink/10">
                  <div className="flex items-start gap-3">
                    <InfoIcon width={16} height={16} className="mt-0.5 shrink-0 text-chestnut" />
                    <div className="text-xs text-ink/70 leading-relaxed">
                      <p className="font-semibold text-ink">Simple &amp; Safe Checkout</p>
                      <p className="mt-0.5">
                        Once you place your order, your order number is generated instantly and stock is
                        reserved. Our dispatch team contacts you immediately via WhatsApp/SMS to facilitate
                        prompt payment and shipping.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Delivery Summary Recap */}
                <div className="mt-6 rounded-lg border border-ink/10 bg-stone-50/60 p-4 text-xs text-ink/70">
                  <div className="flex justify-between items-center pb-2 border-b border-ink/10 font-semibold text-ink">
                    <span>Delivery Summary</span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-chestnut underline hover:text-black font-normal"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p>
                      <strong className="text-ink">Recipient:</strong> {form.name} ({form.phone})
                    </p>
                    <p>
                      <strong className="text-ink">Method:</strong> {delivery.label}
                    </p>
                    {delivery.id !== 'collection' && (
                      <p>
                        <strong className="text-ink">Destination:</strong> {form.address}, {form.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS: Bottom Right on Desktop, responsive on Mobile */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-ink/10 pt-6">
              <div>
                {step > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => setStep((s) => s - 1)}
                    className="w-full sm:w-auto h-12 px-6"
                  >
                    ← Back to {STEPS[step - 1].title}
                  </Button>
                ) : (
                  <Link
                    href="/cart"
                    className="inline-flex h-12 items-center justify-center text-xs uppercase tracking-wider text-ink/65 hover:text-ink underline underline-offset-4"
                  >
                    ← Return to Shopping Bag
                  </Link>
                )}
              </div>

              {/* Primary Forward Action: Aligned to Bottom Right on Desktop */}
              <div className="flex sm:justify-end">
                {step < STEPS.length - 1 ? (
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    className="w-full sm:w-auto min-w-[200px] h-12 bg-black text-white hover:bg-neutral-800 shadow-sm"
                  >
                    Continue to {STEPS[step + 1].title} →
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                    className="w-full sm:w-auto min-w-[240px] h-14 bg-black text-white hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2"
                  >
                    <LockIcon width={14} height={14} className="text-gold" />
                    <span>{submitting ? 'Placing Order…' : `Place Order • ${formatKsh(total)}`}</span>
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Desktop Sticky Order Summary Column */}
          <aside
            aria-label="Order summary"
            className="hidden lg:block sticky top-28 h-fit space-y-4"
          >
            <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <h2 className="font-serif text-lg font-medium text-ink">Order Summary</h2>
                <span className="text-xs text-ink/50">{activeCart.length} item(s)</span>
              </div>

              {/* Line Items */}
              <ul className="mt-4 max-h-[360px] overflow-y-auto divide-y divide-ink/10 pr-1">
                {activeCart.map((item) => (
                  <li key={item.key} className="flex gap-3.5 py-3.5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={72}
                      className="h-18 w-14 shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm text-ink line-clamp-1">{item.name}</p>
                      <p className="mt-0.5 text-xs text-ink/55">
                        {item.length ? `${item.length} in` : ''}
                        {item.color ? ` · ${item.color}` : ''}
                      </p>
                      <p className="text-[11px] text-ink/50">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-ink">
                      {formatKsh(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Cost Calculations */}
              <dl className="mt-4 space-y-2.5 border-t border-ink/10 pt-4 text-xs">
                <div className="flex justify-between text-ink/70">
                  <dt>Subtotal</dt>
                  <dd>{formatKsh(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-ink/70">
                  <dt>{delivery.label}</dt>
                  <dd className="font-medium text-ink">
                    {delivery.fee === 0 ? 'Free' : formatKsh(delivery.fee)}
                  </dd>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-chestnut">
                    <dt>Discount ({discount?.code})</dt>
                    <dd>− {formatKsh(discountAmount)}</dd>
                  </div>
                )}
              </dl>

              {/* Total */}
              <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/60">Total</span>
                <span className="font-serif text-2xl font-bold text-ink">
                  {formatKsh(total)}
                </span>
              </div>

              {/* Guarantees */}
              <div className="mt-6 rounded-lg bg-cream/50 p-3 text-[11px] text-ink/65 space-y-1.5 border border-ink/5">
                <div className="flex items-center gap-1.5 font-medium text-ink">
                  <ShieldCheckIcon width={14} height={14} className="text-chestnut" />
                  <span>100% Authentic Virgin &amp; Raw Hair</span>
                </div>
                <p className="leading-tight">
                  Dispatched in discrete luxury Dallian packaging.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}