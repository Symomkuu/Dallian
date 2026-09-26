'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BoxesIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  PackageIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react';
import {
  adminFetchOrders,
  adminFetchStats,
  AdminStats,
  BackendOrderListItem,
} from '@/utils/api';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatDate, formatKsh } from '@/utils/format';

const statusTone: Record<string, string> = {
  pending:            'bg-amber-50 text-amber-800 border-amber-200',
  payment_confirmed:  'bg-blue-50 text-blue-800 border-blue-200',
  processing:         'bg-purple-50 text-purple-800 border-purple-200',
  ready_for_delivery: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  out_for_delivery:   'bg-sky-50 text-sky-800 border-sky-200',
  delivered:          'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled:          'bg-red-50 text-red-700 border-red-200',
  refunded:           'bg-rose-50 text-rose-700 border-rose-200',
};

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  href,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ width?: number; height?: number; className?: string }>;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
  href?: string;
}) {
  const content = (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">
          {label}
        </span>
        <span
          className={cx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105',
            colorScheme.bg,
            colorScheme.text,
            colorScheme.border
          )}
        >
          <Icon width={20} height={20} />
        </span>
      </div>

      <div className="mt-3">
        <p className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-ink/45 font-medium">{subtitle}</p>
        )}
      </div>

      {href && (
        <div className="mt-3.5 pt-3 border-t border-ink/8 flex items-center justify-between text-xs font-semibold text-[#8B3A2A]">
          <span>View Details</span>
          <ChevronRightIcon width={14} height={14} />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block focus:outline-none">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

export default function AdminDashboardPage() {
  const { user } = useStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<BackendOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, ordersData] = await Promise.all([
        adminFetchStats(),
        adminFetchOrders(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 6));
    } catch {
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-luxe text-[#8B3A2A]">Overview</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Real-time analytics, revenue, and active orders for Dallian.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          aria-label="Refresh dashboard data"
          className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink/70 shadow-2xs transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] disabled:opacity-40"
        >
          <RefreshCwIcon width={13} height={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error alert */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="font-semibold underline ml-2">Retry</button>
        </div>
      )}

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-ink/5 border border-ink/10" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Revenue"
              value={formatKsh(stats?.total_revenue ?? 0)}
              subtitle="All confirmed & paid orders"
              icon={TrendingUpIcon}
              colorScheme={{
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
              }}
            />

            <StatCard
              label="Total Orders"
              value={String(stats?.total_orders ?? 0)}
              subtitle="All lifetime orders"
              icon={PackageIcon}
              colorScheme={{
                bg: 'bg-[#8B3A2A]/10',
                text: 'text-[#8B3A2A]',
                border: 'border-[#8B3A2A]/20',
              }}
              href="/admin/orders"
            />

            <StatCard
              label="Pending Orders"
              value={String(stats?.pending_orders ?? 0)}
              subtitle="Awaiting confirmation"
              icon={ClockIcon}
              colorScheme={{
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
              }}
              href="/admin/orders"
            />

            <StatCard
              label="Registered Customers"
              value={String(stats?.total_customers ?? 0)}
              subtitle="Active customer accounts"
              icon={UsersIcon}
              colorScheme={{
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
              }}
            />
          </>
        )}
      </div>

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-ink/5 border border-ink/10" />
          ))
        ) : (
          <>
            <StatCard
              label="In Preparation"
              value={String(stats?.processing_orders ?? 0)}
              subtitle="Orders being customized/packed"
              icon={PackageIcon}
              colorScheme={{
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                border: 'border-purple-200',
              }}
              href="/admin/orders"
            />

            <StatCard
              label="Delivered Orders"
              value={String(stats?.delivered_orders ?? 0)}
              subtitle="Successfully fulfilled"
              icon={CheckCircleIcon}
              colorScheme={{
                bg: 'bg-teal-50',
                text: 'text-teal-700',
                border: 'border-teal-200',
              }}
              href="/admin/orders"
            />

            <StatCard
              label="Catalogue Products"
              value={String(stats?.total_products ?? 0)}
              subtitle="Active luxury wigs in store"
              icon={BoxesIcon}
              colorScheme={{
                bg: 'bg-neutral-100',
                text: 'text-neutral-800',
                border: 'border-neutral-200',
              }}
              href="/admin/products"
            />
          </>
        )}
      </div>

      {/* Recent Orders Section */}
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-ink/10 bg-[#FAF7F2] px-5 py-4 sm:px-6">
          <div>
            <p className="label-luxe text-[#8B3A2A]">Real-Time Feed</p>
            <h2 className="text-base font-bold text-ink">Recent Orders</h2>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink/75 transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] shadow-2xs"
          >
            <span>View All Orders</span>
            <ChevronRightIcon width={14} height={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-ink/5" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <PackageIcon width={36} height={36} className="mx-auto text-ink/20" />
            <p className="mt-3 text-sm font-semibold text-ink/60">No orders placed yet</p>
            <p className="mt-1 text-xs text-ink/40">Orders will appear here as soon as customers checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-[11px] font-semibold uppercase tracking-wider text-ink/50 bg-[#FAF9F6]">
                  <th className="px-5 py-3 sm:px-6">Order</th>
                  <th className="px-5 py-3 sm:px-6">Customer</th>
                  <th className="px-5 py-3 sm:px-6">Items</th>
                  <th className="px-5 py-3 sm:px-6">Date</th>
                  <th className="px-5 py-3 sm:px-6">Total</th>
                  <th className="px-5 py-3 sm:px-6">Status</th>
                  <th className="px-5 py-3 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-ink sm:px-6">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-semibold text-ink">{order.customer_name}</p>
                      <p className="text-[11px] text-ink/45">
                        {order.is_guest ? 'Guest customer' : 'Registered member'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink/70 sm:px-6">
                      {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink/55 sm:px-6 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-ink sm:px-6">
                      {formatKsh(parseFloat(order.total_amount))}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <span
                        className={cx(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
                          statusTone[order.status] ?? 'bg-ink/5 text-ink/60 border-ink/10'
                        )}
                      >
                        {order.status_display}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 sm:px-6 text-right">
                      <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1 rounded-lg border border-ink/15 bg-white px-2.5 py-1 text-xs font-medium text-ink transition hover:border-[#8B3A2A] hover:text-[#8B3A2A] shadow-2xs"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
