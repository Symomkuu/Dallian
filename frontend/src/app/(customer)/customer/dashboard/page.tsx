'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeartIcon, PackageIcon, ShoppingBagIcon, ClockIcon, ExternalLinkIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatDate, formatKsh } from '@/utils/format';
import { fetchMyOrders, type BackendOrderListItem } from '@/utils/api';

const statusTone: Record<string, string> = {
  pending: 'bg-[#F2E9DA] text-ink/70',
  Pending: 'bg-[#F2E9DA] text-ink/70',
  payment_confirmed: 'bg-[#D99B26]/20 text-ink',
  'Payment Confirmed': 'bg-[#D99B26]/20 text-ink',
  processing: 'bg-chestnut/12 text-chestnut',
  Processing: 'bg-chestnut/12 text-chestnut',
  ready_for_delivery: 'bg-chestnut/12 text-chestnut',
  'Ready for Delivery': 'bg-chestnut/12 text-chestnut',
  out_for_delivery: 'bg-black text-white',
  'Out for Delivery': 'bg-black text-white',
  delivered: 'bg-emerald-50 text-emerald-800',
  Delivered: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-red-50 text-red-700',
  Cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-red-50 text-red-700',
  Returned: 'bg-red-50 text-red-700',
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ width?: number; height?: number; className?: string }>;
}) {
  return (
    <div className="flex items-center gap-4 border border-ink/10 bg-white p-5 rounded-xl shadow-xs">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chestnut/10">
        <Icon width={18} height={18} className="text-chestnut" />
      </span>
      <div>
        <p className="text-xs text-ink/55">{label}</p>
        <p suppressHydrationWarning className="mt-1 font-serif text-2xl text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { user, cartCount, wishlist, recentlyViewed, lastOrder } = useStore();

  const [liveOrders, setLiveOrders] = useState<BackendOrderListItem[]>([]);

  useEffect(() => {
    let active = true;
    fetchMyOrders()
      .then((res) => {
        if (active) setLiveOrders(res || []);
      })
      .catch(() => {
        // Guest or network error, fallback gracefully
      });
    return () => {
      active = false;
    };
  }, []);

  const latestOrder = liveOrders[0];
  const lastOrderStatus = latestOrder
    ? latestOrder.status_display
    : lastOrder
      ? lastOrder.status
      : '—';

  return (
    <div className="space-y-8">
      <div>
        <p className="label-luxe text-chestnut">Dashboard</p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-ink/55">Here&apos;s a quick look at your account.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Items in Bag" value={String(cartCount)} icon={ShoppingBagIcon} />
        <StatCard label="Wishlist" value={String(wishlist.length)} icon={HeartIcon} />
        <StatCard label="Recently Viewed" value={String(recentlyViewed.length)} icon={ClockIcon} />
        <StatCard label="Last Order" value={lastOrderStatus} icon={PackageIcon} />
      </div>

      <div className="border border-ink/10 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-ink/10">
          <p className="label-luxe text-ink/75 font-semibold">Your Orders</p>
          <Link
            href="/customer/orders"
            className="text-xs text-chestnut hover:text-black transition flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ExternalLinkIcon width={12} height={12} />
          </Link>
        </div>

        {liveOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-cream/40 text-xs text-ink/60 border-b border-ink/10">
                  <th className="px-5 py-3 font-semibold sm:px-6">Order ID</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Date</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Items</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Total</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Status</th>
                  <th className="px-5 py-3 font-semibold sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {liveOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-cream/20 transition">
                    <td className="px-5 py-3.5 font-mono font-medium text-ink sm:px-6">
                      <Link
                        href="/customer/orders"
                        className="hover:underline text-chestnut"
                      >
                        {ord.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink/65 sm:px-6">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-ink/65 sm:px-6">
                      {ord.item_count} item(s)
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-ink sm:px-6">
                      {formatKsh(parseFloat(ord.total_amount))}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <span
                        className={cx(
                          'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                          statusTone[ord.status] || 'bg-cream text-ink'
                        )}
                      >
                        {ord.status_display}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 sm:px-6 text-right">
                      <Link
                        href="/customer/orders"
                        className="inline-flex items-center gap-1 rounded bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-800 transition"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : lastOrder ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-cream/40 text-xs text-ink/60 border-b border-ink/10">
                  <th className="px-5 py-3 font-semibold sm:px-6">Order</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Date</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Total</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Status</th>
                  <th className="px-5 py-3 font-semibold sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-ink/10">
                  <td className="px-5 py-3 font-mono font-medium text-ink sm:px-6">
                    {lastOrder.id}
                  </td>
                  <td className="px-5 py-3 text-ink/55 sm:px-6">
                    {formatDate(lastOrder.placedAt)}
                  </td>
                  <td className="px-5 py-3 text-ink/70 sm:px-6 font-semibold">
                    {formatKsh(lastOrder.total)}
                  </td>
                  <td className="px-5 py-3 sm:px-6">
                    <span className={cx('px-2.5 py-1 text-[11px] rounded-full', statusTone[lastOrder.status])}>
                      {lastOrder.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 sm:px-6 text-right">
                    <Link
                      href="/customer/orders"
                      className="inline-flex items-center gap-1 rounded bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-800 transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center sm:px-6">
            <p className="text-sm text-ink/55">You haven&apos;t placed an order yet.</p>
            <Link
              href="/"
              className="bg-black px-5 py-2.5 text-xs tracking-widest text-white uppercase transition-colors duration-200 hover:bg-neutral-800"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {recentlyViewed.length > 0 && (
        <div className="border border-ink/10 bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-ink/10">
            <p className="label-luxe text-ink/75 font-semibold">Recently Viewed</p>
            <span className="text-xs text-ink/45">{recentlyViewed.length} products</span>
          </div>
          <p className="px-5 py-6 text-sm text-ink/55 sm:px-6">
            Your recently viewed products will appear here once you browse the collection.
          </p>
        </div>
      )}
    </div>
  );
}
