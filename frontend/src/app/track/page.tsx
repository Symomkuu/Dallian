import React, { useState } from 'react';
import { CheckIcon, PackageSearchIcon } from 'lucide-react';
import { orders } from '../data/admin';
import { useStore } from '../contexts/StoreContext';
import { cx, formatDate, formatKsh } from '../utils/format';
import { PageHeader } from '../components/PageHeader';
import { TextField } from '../components/ui/TextField';
import { Button } from '../components/ui/Button';
import type { Order } from '../types';

const timeline = [
'Order Placed',
'Payment Confirmed',
'Processing',
'Ready for Delivery',
'Out for Delivery',
'Delivered'];


function stageIndex(status: string): number {
  const map: Record<string, number> = {
    Pending: 0,
    'Payment Confirmed': 1,
    Processing: 2,
    'Ready for Delivery': 3,
    'Out for Delivery': 4,
    Delivered: 5
  };
  return map[status] ?? 0;
}

export function OrderTracking() {
  const { lastOrder } = useStore();
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Order | null>(null);

  const lookup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reference.trim() || !contact.trim()) {
      setError('Enter your order number and the phone number or email used at checkout.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const pool = lastOrder ? [lastOrder, ...orders] : orders;
      const found = pool.find((order) => order.id.toLowerCase() === reference.trim().toLowerCase());
      if (!found) {
        setError('We could not find that order number. Check it and try again, or contact our team.');
        setResult(null);
      } else {
        setResult(found);
      }
      setLoading(false);
    }, 600);
  };

  const current = result ? stageIndex(result.status) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Order Tracking"
        title="Track Your Order"
        body="Enter your order number together with the phone number or email you used at checkout."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Track Order' }]} />
      

      <div className="mx-auto grid max-w-page gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        <form onSubmit={lookup} noValidate className="border border-ink/10 bg-white p-7 lg:h-fit">
          <h2 className="font-serif text-xl text-ink">Find your order</h2>
          <div className="mt-6 space-y-5">
            <TextField
              label="Order Number"
              value={reference}
              hint={lastOrder ? `Your most recent order: ${lastOrder.id}` : 'For example DLH-24081'}
              onChange={(event) => setReference(event.target.value)} />
            
            <TextField
              label="Phone Number or Email"
              value={contact}
              onChange={(event) => setContact(event.target.value)} />
            
          </div>
          {error && <p className="mt-4 text-xs text-red-700">{error}</p>}
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? 'Searching…' : 'Track Order'}
          </Button>
        </form>

        <section aria-live="polite">
          {!result ?
          <div className="flex h-full flex-col items-center justify-center border border-dashed border-ink/15 bg-white p-10 text-center">
              <PackageSearchIcon width={24} height={24} className="text-chestnut" />
              <p className="mt-4 font-serif text-xl text-ink">Your order status appears here</p>
              <p className="mt-2 max-w-sm text-sm text-ink/60">
                Each stage updates as our team processes, prepares and dispatches your order.
              </p>
            </div> :

          <div className="border border-ink/10 bg-white p-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
                <div>
                  <p className="label-luxe text-ink/50">Order {result.id}</p>
                  <p className="mt-2 font-serif text-2xl text-ink">{result.status}</p>
                  <p className="mt-1 text-xs text-ink/55">Placed {formatDate(result.placedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-ink">{formatKsh(result.total)}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {result.paymentMethod} · {result.paymentStatus}
                  </p>
                </div>
              </div>

              <ol className="mt-7">
                {timeline.map((stage, index) => {
                const complete = index <= current;
                return (
                  <li key={stage} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                        className={cx(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px]',
                          complete ? 'border-gold bg-gold text-ink' : 'border-ink/20 text-ink/40'
                        )}>
                        
                          {complete ? <CheckIcon width={13} height={13} /> : index + 1}
                        </span>
                        {index < timeline.length - 1 &&
                      <span
                        className={cx('w-px flex-1', index < current ? 'bg-gold' : 'bg-ink/15')}
                        style={{ minHeight: 34 }} />

                      }
                      </div>
                      <div className="pb-6">
                        <p className={cx('text-sm', complete ? 'text-ink' : 'text-ink/45')}>{stage}</p>
                        {index === current &&
                      <p className="mt-1 text-xs text-chestnut">Current stage</p>
                      }
                      </div>
                    </li>);

              })}
              </ol>

              <div className="border-t border-ink/10 pt-5">
                <p className="label-luxe text-ink/50">Delivery</p>
                <p className="mt-2 text-sm text-ink/75">{result.delivery.method}</p>
                <p className="text-sm text-ink/55">{result.delivery.address}</p>
              </div>
            </div>
          }
        </section>
      </div>
    </>);

}