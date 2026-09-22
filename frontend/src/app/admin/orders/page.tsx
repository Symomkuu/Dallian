'use client';
import React, { useMemo, useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { orders as seedOrders } from '@/data/admin';
import type { Order, OrderStatus } from '../../types';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatDate, formatKsh } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';

const statuses: OrderStatus[] = [
'Pending',
'Payment Confirmed',
'Processing',
'Ready for Delivery',
'Out for Delivery',
'Delivered',
'Cancelled',
'Returned'];


const statusTone: Record<string, string> = {
  Pending: 'bg-cream-deep text-ink/70',
  'Payment Confirmed': 'bg-gold/20 text-ink',
  Processing: 'bg-chestnut/12 text-chestnut-deep',
  'Ready for Delivery': 'bg-chestnut/12 text-chestnut-deep',
  'Out for Delivery': 'bg-ink text-cream',
  Delivered: 'bg-emerald-50 text-emerald-800',
  Cancelled: 'bg-red-50 text-red-700',
  Returned: 'bg-red-50 text-red-700'
};

export function AdminOrders() {
  const { pushToast } = useStore();
  const [rows, setRows] = useState<Order[]>(seedOrders);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(
    () =>
    rows.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (query) {
        const haystack = `${order.id} ${order.customer} ${order.phone} ${order.email}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    }),
    [rows, query, statusFilter]
  );

  const update = (id: string, patch: Partial<Order>, message: string) => {
    setRows((prev) => prev.map((order) => order.id === id ? { ...order, ...patch } : order));
    setSelected((prev) => prev && prev.id === id ? { ...prev, ...patch } : prev);
    pushToast({ title: message, tone: 'success' });
  };

  return (
    <>
      <AdminPageHeader
        title="Orders"
        body="Search, filter and progress orders through fulfilment. Payment and delivery status update the customer's tracking view." />
      

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="relative min-w-56 flex-1">
          <label htmlFor="order-search" className="label-luxe text-ink/60">
            Search orders
          </label>
          <SearchIcon width={15} height={15} className="pointer-events-none absolute bottom-3.5 left-3.5 text-ink/40" />
          <input
            id="order-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Order number, customer, phone or email"
            className="mt-1.5 h-11 w-full border border-ink/20 bg-white pl-10 pr-4 text-sm focus:border-chestnut focus:outline-none" />
          
        </div>
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-56"
          options={[{ value: 'all', label: 'All statuses' }, ...statuses.map((s) => ({ value: s, label: s }))]} />
        
      </div>

      <div className="border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                {['Order', 'Customer', 'Placed', 'Payment', 'Total', 'Status', ''].map((header) =>
                <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                    {header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {filtered.map((order) =>
              <tr key={order.id} className="transition-colors duration-150 hover:bg-cream/60">
                  <td className="px-5 py-4 text-ink">{order.id}</td>
                  <td className="px-5 py-4">
                    <p className="text-ink/80">{order.customer}</p>
                    <p className="text-xs text-ink/50">{order.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-ink/60">{formatDate(order.placedAt)}</td>
                  <td className="px-5 py-4 text-ink/70">
                    {order.paymentMethod}
                    <span className="block text-xs text-ink/50">{order.paymentStatus}</span>
                  </td>
                  <td className="px-5 py-4 text-ink">{formatKsh(order.total)}</td>
                  <td className="px-5 py-4">
                    <span className={cx('px-2.5 py-1 text-[11px]', statusTone[order.status])}>{order.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                    type="button"
                    onClick={() => setSelected(order)}
                    className="label-luxe text-chestnut hover:underline">
                    
                      View
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 &&
        <p className="px-5 py-10 text-center text-sm text-ink/55">No orders match that search.</p>
        }
      </div>

      {selected &&
      <div className="fixed inset-0 z-[60]">
          <button
          type="button"
          aria-label="Close order"
          onClick={() => setSelected(null)}
          className="absolute inset-0 bg-ink/55" />
        
          <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-cream shadow-panel">
            <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-cream px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl text-ink">{selected.id}</h2>
                <p className="mt-1 text-xs text-ink/55">Placed {formatDate(selected.placedAt)}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close order" className="p-1.5">
                <XIcon width={20} height={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <section className="border border-ink/10 bg-white p-5">
                <h3 className="label-luxe text-ink/50">Customer</h3>
                <p className="mt-3 font-serif text-lg text-ink">{selected.customer}</p>
                <p className="text-sm text-ink/60">{selected.phone}</p>
                <p className="text-sm text-ink/60">{selected.email}</p>
              </section>

              <section className="mt-5 border border-ink/10 bg-white p-5">
                <h3 className="label-luxe text-ink/50">Items</h3>
                <ul className="mt-3 divide-y divide-ink/10">
                  {selected.items.map((item) =>
                <li key={item.name + item.options} className="flex items-center gap-3 py-3">
                      <img src={item.image} alt="" className="h-16 w-13 object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-ink">{item.name}</p>
                        <p className="text-xs text-ink/55">{item.options}</p>
                        <p className="text-xs text-ink/55">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm text-ink">{formatKsh(item.price * item.quantity)}</p>
                    </li>
                )}
                </ul>
                <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-sm">
                  <span className="text-ink/60">Total</span>
                  <span className="font-serif text-lg text-ink">{formatKsh(selected.total)}</span>
                </div>
              </section>

              <section className="mt-5 border border-ink/10 bg-white p-5">
                <h3 className="label-luxe text-ink/50">Delivery</h3>
                <p className="mt-3 text-sm text-ink/75">{selected.delivery.method}</p>
                <p className="text-sm text-ink/55">{selected.delivery.address}</p>
              </section>

              <section className="mt-5 border border-ink/10 bg-white p-5">
                <h3 className="label-luxe text-ink/50">Update order</h3>
                <div className="mt-4 space-y-4">
                  <SelectField
                  label="Order Status"
                  value={selected.status}
                  options={statuses.map((s) => ({ value: s, label: s }))}
                  onChange={(event) =>
                  update(selected.id, { status: event.target.value as OrderStatus }, 'Order status updated.')
                  } />
                
                  <div className="flex flex-wrap gap-2.5">
                    <Button
                    size="sm"
                    onClick={() =>
                    update(
                      selected.id,
                      { paymentStatus: 'Confirmed', status: 'Payment Confirmed' },
                      'Payment confirmed.'
                    )
                    }>
                    
                      Confirm Payment
                    </Button>
                    <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => update(selected.id, { status: 'Out for Delivery' }, 'Delivery status updated.')}>
                    
                      Mark Out for Delivery
                    </Button>
                    <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => update(selected.id, { status: 'Returned', paymentStatus: 'Refunded' }, 'Return processed.')}>
                    
                      Process Return
                    </Button>
                    <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => update(selected.id, { status: 'Cancelled' }, 'Order cancelled.')}>
                    
                      Cancel Order
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      }
    </>);

}