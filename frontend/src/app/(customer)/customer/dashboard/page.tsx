'use client';

import React from 'react';
import Link from 'next/link';
import { HeartIcon, PackageIcon, ShoppingBagIcon, ClockIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { products } from '@/data/products';
import { cx, formatDate, formatKsh } from '@/utils/format';

const statusTone: Record<string, string> = {
  Pending: 'bg-[#F2E9DA] text-ink/70',
  'Payment Confirmed': 'bg-[#D99B26]/20 text-ink',
  Processing: 'bg-chestnut/12 text-chestnut',
  'Ready for Delivery': 'bg-chestnut/12 text-chestnut',
  'Out for Delivery': 'bg-black text-white',
  Delivered: 'bg-emerald-50 text-emerald-800',
  Cancelled: 'bg-red-50 text-red-700',
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
    <div className="flex items-center gap-4 border border-ink/10 bg-white p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chestnut/10">
        <Icon width={18} height={18} className="text-chestnut" />
      </span>
      <div>
        <p className="text-xs text-ink/55">{label}</p>
        <p className="mt-1 font-serif text-2xl text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { user, cartCount, wishlist, recentlyViewed, lastOrder } = useStore();

  const recentlyViewedProducts = recentlyViewed
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product))
    .slice(0, 4);

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
        <StatCard label="Last Order" value={lastOrder ? lastOrder.status : '—'} icon={PackageIcon} />
      </div>

      <div className="border border-ink/10 bg-white">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <p className="label-luxe text-ink/50">Recent Orders</p>
        </div>
        {lastOrder ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-t border-ink/10 text-xs text-ink/45">
                  <th className="px-5 py-2.5 font-medium sm:px-6">Order</th>
                  <th className="px-5 py-2.5 font-medium sm:px-6">Date</th>
                  <th className="px-5 py-2.5 font-medium sm:px-6">Total</th>
                  <th className="px-5 py-2.5 font-medium sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-ink/10">
                  <td className="px-5 py-3 font-medium text-ink sm:px-6">{lastOrder.id}</td>
                  <td className="px-5 py-3 text-ink/55 sm:px-6">{formatDate(lastOrder.placedAt)}</td>
                  <td className="px-5 py-3 text-ink/70 sm:px-6">{formatKsh(lastOrder.total)}</td>
                  <td className="px-5 py-3 sm:px-6">
                    <span className={cx('px-2.5 py-1 text-[11px]', statusTone[lastOrder.status])}>
                      {lastOrder.status}
                    </span>
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

      {recentlyViewedProducts.length > 0 && (
        <div className="border border-ink/10 bg-white p-5 sm:p-6">
          <p className="label-luxe text-ink/50">Recently Viewed</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentlyViewedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group border border-ink/10"
              >
                <div className="aspect-square overflow-hidden bg-cream">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium text-ink">{product.name}</p>
                  <p className="mt-1 text-sm font-semibold text-chestnut">{formatKsh(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
