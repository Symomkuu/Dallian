import React, { useState } from 'react';
import { InfoIcon } from 'lucide-react';
import { orders } from '../../data/admin';
import { useStore } from '../../contexts/StoreContext';
import { cx, formatDate, formatKsh } from '../../utils/format';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';

export function AdminPayments() {
  const { pushToast } = useStore();
  const [methods, setMethods] = useState({ mpesa: true, card: true, onDelivery: false });

  const confirmed = orders.filter((order) => order.paymentStatus === 'Confirmed');
  const awaiting = orders.filter((order) => order.paymentStatus === 'Awaiting Payment');

  return (
    <>
      <AdminPageHeader
        title="Payments"
        body="Enable the payment methods customers see at checkout and review payment status per order." />
      

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Confirmed"
          value={formatKsh(confirmed.reduce((sum, order) => sum + order.total, 0))}
          delta={`${confirmed.length} orders`}
          tone="feature" />
        
        <StatCard label="Awaiting Payment" value={String(awaiting.length)} tone="alert" />
        <StatCard label="Refunded" value={String(orders.filter((o) => o.paymentStatus === 'Refunded').length)} />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Payment methods</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-ink/55">
            Account and till details are entered here by the business and are never shown until a customer
            reaches the payment step.
          </p>

          <ul className="mt-6 space-y-3">
            {[
            { key: 'mpesa' as const, label: 'M-Pesa', detail: 'Mobile money' },
            { key: 'card' as const, label: 'Card Payment', detail: 'Visa / Mastercard' },
            { key: 'onDelivery' as const, label: 'Pay on Delivery', detail: 'Selected areas only' }].
            map((method) =>
            <li
              key={method.key}
              className="flex items-center justify-between gap-4 border border-ink/12 px-5 py-4">
              
                <div>
                  <p className="text-sm text-ink">{method.label}</p>
                  <p className="text-xs text-ink/50">{method.detail}</p>
                </div>
                <button
                type="button"
                role="switch"
                aria-checked={methods[method.key]}
                onClick={() => setMethods((prev) => ({ ...prev, [method.key]: !prev[method.key] }))}
                className={cx(
                  'relative h-6 w-11 rounded-full transition-colors duration-200',
                  methods[method.key] ? 'bg-chestnut' : 'bg-ink/20'
                )}>
                
                  <span className="sr-only">Toggle {method.label}</span>
                  <span
                  className={cx(
                    'absolute top-1 h-4 w-4 rounded-full bg-cream transition-transform duration-200',
                    methods[method.key] ? 'translate-x-6' : 'translate-x-1'
                  )} />
                
                </button>
              </li>
            )}
          </ul>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              pushToast({ title: 'Payment configuration saved.', tone: 'success' });
            }}>
            
            <TextField label="M-Pesa Business Number" placeholder="Enter the number provided by Safaricom" />
            <TextField label="M-Pesa Account Name" placeholder="Account reference shown to customers" />
            <TextField label="Card Processor Key" placeholder="Paste the key from your processor" />
            <p className="flex items-start gap-2.5 border border-ink/12 bg-cream px-4 py-3 text-xs leading-relaxed text-ink/60">
              <InfoIcon width={14} height={14} className="mt-0.5 shrink-0 text-chestnut" />
              Nothing is published to the storefront until these fields are filled in and saved.
            </p>
            <Button type="submit">Save Configuration</Button>
          </form>
        </section>

        <section className="border border-ink/10 bg-white">
          <h2 className="border-b border-ink/10 px-6 py-5 font-serif text-xl text-ink">Order payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  {['Order', 'Date', 'Method', 'Amount', 'Status'].map((header) =>
                  <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                      {header}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {orders.map((order) =>
                <tr key={order.id}>
                    <td className="px-5 py-4 text-ink">{order.id}</td>
                    <td className="px-5 py-4 text-ink/60">{formatDate(order.placedAt)}</td>
                    <td className="px-5 py-4 text-ink/70">{order.paymentMethod}</td>
                    <td className="px-5 py-4 text-ink">{formatKsh(order.total)}</td>
                    <td className="px-5 py-4">
                      <span
                      className={cx(
                        'px-2.5 py-1 text-[11px]',
                        order.paymentStatus === 'Confirmed' && 'bg-emerald-50 text-emerald-800',
                        order.paymentStatus === 'Awaiting Payment' && 'bg-gold/20 text-ink',
                        order.paymentStatus === 'Refunded' && 'bg-red-50 text-red-700'
                      )}>
                      
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>);

}