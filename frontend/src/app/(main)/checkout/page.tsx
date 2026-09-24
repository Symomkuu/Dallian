'use client';

import React, { useState } from 'react';
import { useNavigate } from '@/components/RouterCompat';
import { CheckIcon, CreditCardIcon, InfoIcon, SmartphoneIcon, StoreIcon, TruckIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatKsh } from '@/utils/format';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';

const steps = ['Customer Information', 'Delivery', 'Payment'];

const deliveryOptions = [
  { id: 'collection', label: 'Store Collection', detail: 'Mountain Mall, Thika Road, Nairobi', fee: 0, icon: StoreIcon },
  { id: 'nairobi', label: 'Nairobi Delivery', detail: 'Timeline confirmed by the store', fee: 500, icon: TruckIcon },
  { id: 'countrywide', label: 'Countrywide Courier', detail: 'Fee depends on your town', fee: 700, icon: TruckIcon }
];

const paymentOptions = [
  { id: 'mpesa', label: 'M-Pesa', detail: 'Payment instructions are sent by the store after you place the order.', icon: SmartphoneIcon },
  { id: 'card', label: 'Card Payment', detail: 'Card processing is enabled and configured by the store administrator.', icon: CreditCardIcon }
];

export default function CheckoutPage() {
  const { activeCart, subtotal, discount, placeOrder, user } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: '',
    email: user?.email ?? '',
    address: '',
    city: 'Nairobi',
    notes: ''
  });
  const [delivery, setDelivery] = useState(deliveryOptions[1]);
  const [payment, setPayment] = useState(paymentOptions[0]);

  const discountAmount = discount ? Math.round(subtotal * discount.amount) : 0;
  const total = subtotal + delivery.fee - discountAmount;

  const validateStep = () => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) next.name = 'Enter the full name for this order.';
      if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, '')))
        next.phone = 'Enter a 10-digit phone number, e.g. 0712345678.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    }
    if (step === 1 && delivery.id !== 'collection' && !form.address.trim()) {
      next.address = 'Enter the delivery address so our team can reach you.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handlePlaceOrder = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      const orderNumber = `DLH-${Math.floor(24100 + Math.random() * 500)}`;
      placeOrder({
        id: orderNumber,
        customer: form.name,
        phone: form.phone,
        email: form.email,
        placedAt: new Date().toISOString().slice(0, 10),
        total,
        status: 'Pending',
        paymentMethod: payment.label,
        paymentStatus: 'Awaiting Payment',
        items: activeCart.map((item) => ({
          name: item.name,
          image: item.image,
          options: `${item.length} in · ${item.color} · ${item.capType}`,
          quantity: item.quantity,
          price: item.price
        })),
        delivery: {
          method: delivery.label,
          address: delivery.id === 'collection' ? delivery.detail : `${form.address}, ${form.city}`,
          fee: delivery.fee
        }
      });
      setSubmitting(false);
      navigate('/order-confirmed');
    }, 900);
  };

  return (
    <>

      <div className="mx-auto max-w-page px-5 py-10 sm:px-8 lg:py-14">
        <ol className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-3">
          {steps.map((label, index) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cx(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs',
                  index < step && 'border-gold bg-gold text-ink',
                  index === step && 'border-ink bg-ink text-cream',
                  index > step && 'border-ink/25 text-ink/45'
                )}
              >
                {index < step ? <CheckIcon width={14} height={14} /> : index + 1}
              </span>
              <span className={cx('label-luxe', index === step ? 'text-ink' : 'text-ink/45')}>{label}</span>
              {index < steps.length - 1 && <span className="hidden h-px w-10 bg-ink/15 sm:block" />}
            </li>
          ))}
        </ol>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <section aria-label={steps[step]}>
            {step === 0 && (
              <div className="border border-ink/10 bg-white p-7">
                <h2 className="font-serif text-2xl text-ink">Customer Information</h2>
                <p className="mt-2 text-sm text-ink/60">
                  No account needed — you can check out as a guest. We only use these details for your order.
                </p>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Full Name"
                    value={form.name}
                    error={errors.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="sm:col-span-2"
                    autoComplete="name"
                  />
                  <TextField
                    label="Phone Number"
                    value={form.phone}
                    error={errors.phone}
                    hint="Used for delivery and order updates"
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={form.email}
                    error={errors.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="border border-ink/10 bg-white p-7">
                <h2 className="font-serif text-2xl text-ink">Delivery</h2>
                <p className="mt-2 text-sm text-ink/60">
                  Options and fees below are configured by Dallian Luxe Hair.
                </p>
                <div className="mt-7 space-y-3">
                  {deliveryOptions.map((option) => (
                    <label
                      key={option.id}
                      className={cx(
                        'flex cursor-pointer items-start gap-4 border p-5 transition-colors duration-200',
                        delivery.id === option.id ? 'border-gold bg-gold/8' : 'border-ink/15 hover:border-ink/35'
                      )}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={delivery.id === option.id}
                        onChange={() => setDelivery(option)}
                        className="sr-only"
                      />
                      <option.icon width={18} height={18} className="mt-0.5 text-chestnut" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-ink">{option.label}</span>
                        <span className="mt-1 block text-xs text-ink/55">{option.detail}</span>
                      </span>
                      <span className="text-sm text-ink">
                        {option.fee === 0 ? 'Free' : formatKsh(option.fee)}
                      </span>
                    </label>
                  ))}
                </div>

                {delivery.id !== 'collection' && (
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="Delivery Address"
                      value={form.address}
                      error={errors.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="sm:col-span-2"
                      autoComplete="street-address"
                    />
                    <TextField
                      label="Town / City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                    <TextField
                      label="Delivery Notes (optional)"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="border border-ink/10 bg-white p-7">
                <h2 className="font-serif text-2xl text-ink">Payment</h2>
                <div className="mt-7 space-y-3">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={cx(
                        'flex cursor-pointer items-start gap-4 border p-5 transition-colors duration-200',
                        payment.id === option.id ? 'border-gold bg-gold/8' : 'border-ink/15 hover:border-ink/35'
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment.id === option.id}
                        onChange={() => setPayment(option)}
                        className="sr-only"
                      />
                      <option.icon width={18} height={18} className="mt-0.5 text-chestnut" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-ink">{option.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-ink/55">{option.detail}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-6 flex items-start gap-3 border border-ink/15 bg-cream px-4 py-4 text-xs leading-relaxed text-ink/65">
                  <InfoIcon width={15} height={15} className="mt-0.5 shrink-0 text-chestnut" />
                  Payment account details are held in the admin dashboard and shared with you by the Dallian
                  Luxe Hair team once your order is placed. Your order status updates to Payment Confirmed as
                  soon as payment is verified.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {step > 0 && (
                <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button size="lg" onClick={handleContinue}>
                  Continue
                </Button>
              ) : (
                <Button size="lg" disabled={submitting} onClick={handlePlaceOrder}>
                  {submitting ? 'Placing Order…' : 'Place Order'}
                </Button>
              )}
            </div>
          </section>

          <aside aria-label="Order summary" className="lg:sticky lg:top-28 lg:h-fit">
            <div className="border border-ink/10 bg-white p-7">
              <h2 className="font-serif text-xl text-ink">Order Summary</h2>
              <ul className="mt-5 divide-y divide-ink/10">
                {activeCart.map((item) => (
                  <li key={item.key} className="flex gap-4 py-4">
                    <img src={item.image} alt="" className="h-20 w-16 object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-base text-ink">{item.name}</p>
                      <p className="mt-0.5 text-xs text-ink/55">
                        {item.length} in · {item.color}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/55">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm text-ink">{formatKsh(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-3 border-t border-ink/10 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink/60">Subtotal</dt>
                  <dd>{formatKsh(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/60">{delivery.label}</dt>
                  <dd>{delivery.fee === 0 ? 'Free' : formatKsh(delivery.fee)}</dd>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Discount ({discount?.code})</dt>
                    <dd className="text-chestnut">− {formatKsh(discountAmount)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-5 flex items-baseline justify-between border-t border-ink/10 pt-5">
                <span className="label-luxe text-ink/55">Total</span>
                <span className="font-serif text-2xl text-ink">{formatKsh(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}