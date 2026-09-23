'use client';
import React, { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { customers as seed, orders } from '@/data/admin';
import type { Customer } from '../../types';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatDate, formatKsh } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';

export function AdminCustomers() {
  const { pushToast } = useStore();
  const [rows, setRows] = useState<Customer[]>(seed);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = useMemo(
    () =>
    rows.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.toLowerCase())
    ),
    [rows, query]
  );

  const toggleStatus = (id: string) => {
    setRows((prev) =>
    prev.map((customer) =>
    customer.id === id ?
    { ...customer, status: customer.status === 'Active' ? 'Disabled' : 'Active' } :
    customer
    )
    );
    pushToast({ title: 'Customer account updated.', tone: 'success' });
  };

  const history = selected ? orders.filter((order) => order.email === selected.email) : [];

  return (
    <>
      <AdminPageHeader
        title="Customers"
        body="Review customer accounts, order history and account status." />
      

      <div className="mb-5 max-w-md">
        <label htmlFor="customer-search" className="label-luxe text-ink/60">
          Search customers
        </label>
        <div className="relative">
          <SearchIcon width={15} height={15} className="pointer-events-none absolute bottom-3.5 left-3.5 text-ink/40" />
          <input
            id="customer-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, email or phone"
            className="mt-1.5 h-11 w-full border border-ink/20 bg-white pl-10 pr-4 text-sm focus:border-chestnut focus:outline-none" />
          
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="border border-ink/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  {['Customer', 'Contact', 'Orders', 'Spend', 'Status', ''].map((header) =>
                  <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                      {header}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {filtered.map((customer) =>
                <tr key={customer.id} className="transition-colors duration-150 hover:bg-cream/60">
                    <td className="px-5 py-4">
                      <p className="text-ink">{customer.name}</p>
                      <p className="text-xs text-ink/50">
                        {customer.id} · joined {formatDate(customer.joined)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-ink/65">
                      {customer.email}
                      <span className="block text-xs text-ink/50">{customer.phone}</span>
                    </td>
                    <td className="px-5 py-4 text-ink/70">{customer.orders}</td>
                    <td className="px-5 py-4 text-ink">{formatKsh(customer.spend)}</td>
                    <td className="px-5 py-4">
                      <span
                      className={cx(
                        'px-2.5 py-1 text-[11px]',
                        customer.status === 'Active' ?
                        'bg-emerald-50 text-emerald-800' :
                        'bg-red-50 text-red-700'
                      )}>
                      
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                      type="button"
                      onClick={() => setSelected(customer)}
                      className="label-luxe text-chestnut hover:underline">
                      
                        View
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="border border-ink/10 bg-white p-6 xl:h-fit">
          {selected ?
          <>
              <h2 className="font-serif text-2xl text-ink">{selected.name}</h2>
              <p className="mt-1 text-sm text-ink/60">{selected.email}</p>
              <p className="text-sm text-ink/60">{selected.phone}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-ink/10 py-5 text-sm">
                <div>
                  <dt className="label-luxe text-ink/50">Orders</dt>
                  <dd className="mt-1.5 font-serif text-xl text-ink">{selected.orders}</dd>
                </div>
                <div>
                  <dt className="label-luxe text-ink/50">Lifetime Spend</dt>
                  <dd className="mt-1.5 font-serif text-xl text-ink">{formatKsh(selected.spend)}</dd>
                </div>
              </dl>

              <h3 className="label-luxe mt-6 text-ink/50">Order history</h3>
              {history.length > 0 ?
            <ul className="mt-3 divide-y divide-ink/10">
                  {history.map((order) =>
              <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="text-ink/75">{order.id}</span>
                      <span className="text-xs text-ink/50">{order.status}</span>
                      <span className="text-ink">{formatKsh(order.total)}</span>
                    </li>
              )}
                </ul> :

            <p className="mt-3 text-sm text-ink/55">No orders recorded against this account yet.</p>
            }

              <Button
              variant="secondary"
              className="mt-7 w-full"
              onClick={() => toggleStatus(selected.id)}>
              
                {selected.status === 'Active' ? 'Disable Account' : 'Enable Account'}
              </Button>
            </> :

          <p className="text-sm text-ink/55">
              Select a customer to see their details and order history.
            </p>
          }
        </aside>
      </div>
    </>);

}