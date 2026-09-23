'use client';

import React from 'react';
import { PackageIcon, TrendingUpIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { customers, orders } from '@/data/admin';
import { cx, formatDate, formatKsh } from '@/utils/format';
import { useStore } from '@/contexts/StoreContext';

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

export default function AdminDashboardPage() {
  const { user } = useStore();

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === 'Pending').length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <p className="label-luxe text-chestnut">Dashboard</p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-ink/55">Here&apos;s how the store is doing today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatKsh(totalRevenue)} icon={TrendingUpIcon} />
        <StatCard label="Total Orders" value={String(orders.length)} icon={PackageIcon} />
        <StatCard label="Total Customers" value={String(customers.length)} icon={UsersIcon} />
        <StatCard label="Pending Orders" value={String(pendingOrders)} icon={ClockIcon} />
      </div>

      <div className="border border-ink/10 bg-white">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <p className="label-luxe text-ink/50">Recent Orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-t border-ink/10 text-xs text-ink/45">
                <th className="px-5 py-2.5 font-medium sm:px-6">Order</th>
                <th className="px-5 py-2.5 font-medium sm:px-6">Customer</th>
                <th className="px-5 py-2.5 font-medium sm:px-6">Date</th>
                <th className="px-5 py-2.5 font-medium sm:px-6">Total</th>
                <th className="px-5 py-2.5 font-medium sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-ink/10">
                  <td className="px-5 py-3 font-medium text-ink sm:px-6">{order.id}</td>
                  <td className="px-5 py-3 text-ink/70 sm:px-6">{order.customer}</td>
                  <td className="px-5 py-3 text-ink/55 sm:px-6">{formatDate(order.placedAt)}</td>
                  <td className="px-5 py-3 text-ink/70 sm:px-6">{formatKsh(order.total)}</td>
                  <td className="px-5 py-3 sm:px-6">
                    <span className={cx('px-2.5 py-1 text-[11px]', statusTone[order.status])}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
