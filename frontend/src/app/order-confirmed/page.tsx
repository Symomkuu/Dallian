import React from 'react';
import { CheckIcon, MailIcon, PhoneIcon, ShoppingBagIcon } from 'lucide-react';
import { brand } from '../data/brand';
import { useStore } from '../contexts/StoreContext';
import { formatKsh } from '../utils/format';
import { LinkButton } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export function OrderConfirmation() {
  const { lastOrder } = useStore();

  if (!lastOrder) {
    return (
      <div className="mx-auto max-w-page px-5 py-20 sm:px-8">
        <EmptyState
          icon={<ShoppingBagIcon width={22} height={22} />}
          title="No recent order to show"
          body="Once you place an order, your confirmation and order number appear here."
          actionLabel="Shop Wigs"
          actionTo="/shop" />
        
      </div>);

  }

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-gold">
            <CheckIcon width={24} height={24} />
          </span>
          <h1 className="mt-6 font-serif text-4xl text-ink">Order Confirmed!</h1>
          <p className="mt-3 text-sm text-ink/65">
            Thank you, {lastOrder.customer.split(' ')[0]}. Your order has been received and our team will be
            in touch to confirm payment and delivery.
          </p>
        </div>

        <div className="mt-10 border border-ink/10 bg-white">
          <dl className="grid gap-px bg-ink/10 sm:grid-cols-3">
            <div className="bg-white p-6">
              <dt className="label-luxe text-ink/50">Order Number</dt>
              <dd className="mt-2 font-serif text-xl text-ink">{lastOrder.id}</dd>
            </div>
            <div className="bg-white p-6">
              <dt className="label-luxe text-ink/50">Amount</dt>
              <dd className="mt-2 font-serif text-xl text-ink">{formatKsh(lastOrder.total)}</dd>
            </div>
            <div className="bg-white p-6">
              <dt className="label-luxe text-ink/50">Payment Status</dt>
              <dd className="mt-2 text-sm text-chestnut">
                {lastOrder.paymentStatus} · {lastOrder.paymentMethod}
              </dd>
            </div>
          </dl>

          <div className="border-t border-ink/10 p-6">
            <h2 className="label-luxe text-ink/50">Items</h2>
            <ul className="mt-4 divide-y divide-ink/10">
              {lastOrder.items.map((item) =>
              <li key={item.name + item.options} className="flex items-center gap-4 py-4">
                  <img src={item.image} alt="" className="h-20 w-16 object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink/55">{item.options}</p>
                    <p className="mt-0.5 text-xs text-ink/55">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm text-ink">{formatKsh(item.price * item.quantity)}</p>
                </li>
              )}
            </ul>
          </div>

          <div className="border-t border-ink/10 p-6">
            <h2 className="label-luxe text-ink/50">Delivery Information</h2>
            <p className="mt-3 text-sm text-ink/75">{lastOrder.delivery.method}</p>
            <p className="mt-1 text-sm text-ink/60">{lastOrder.delivery.address}</p>
            <div className="mt-5 flex flex-wrap gap-5 text-xs text-ink/60">
              <span className="flex items-center gap-2">
                <PhoneIcon width={13} height={13} className="text-gold" />
                {lastOrder.phone}
              </span>
              <span className="flex items-center gap-2">
                <MailIcon width={13} height={13} className="text-gold" />
                {lastOrder.email}
              </span>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ink/50">
              A confirmation is sent to the phone number and email above where those channels are configured
              by the business. You can also reach us on {brand.phone}.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/track" size="lg" className="flex-1">
            Track My Order
          </LinkButton>
          <LinkButton to="/shop" size="lg" variant="secondary" className="flex-1">
            Continue Shopping
          </LinkButton>
        </div>
      </div>
    </div>);

}