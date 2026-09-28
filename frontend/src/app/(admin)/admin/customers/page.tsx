'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  UserCheckIcon,
  UserXIcon,
  SearchIcon,
  CopyIcon,
  CheckIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ShoppingBagIcon,
  CoinsIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  XIcon,
  FileSpreadsheetIcon,
} from 'lucide-react';
import {
  adminFetchCustomers,
  getAdminCustomersExportUrl,
  type AdminCustomerItem,
  type AdminCustomerStats,
} from '@/utils/api';
import { formatKsh, formatDate, cx } from '@/utils/format';
import { useStore } from '@/contexts/StoreContext';

export default function AdminCustomersPage() {
  const { pushToast } = useStore();

  const [customers, setCustomers] = useState<AdminCustomerItem[]>([]);
  const [stats, setStats] = useState<AdminCustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'registered' | 'guest'>('all');
  const [ordering, setOrdering] = useState('-created_at');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    adminFetchCustomers({
      q: searchQuery,
      type: selectedType,
      ordering: ordering,
      page_size: 200,
    })
      .then((res) => {
        if (!isMounted) return;
        setCustomers(res.results || []);
        if (res.stats) {
          setStats(res.stats);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load customers:', err);
        pushToast({ title: 'Failed to load customers.', tone: 'critical' });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedType, ordering, pushToast]);

  const handleCopy = (text: string, id: string, label: string = 'Copied') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    pushToast({ title: `${label} to clipboard.`, tone: 'success' });
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleExportCSV = () => {
    // Generate full CSV from client or direct download link
    const exportUrl = getAdminCustomersExportUrl({
      q: searchQuery,
      type: selectedType,
      ordering: ordering,
    });

    // Create a temporary link to download
    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', `dallian_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    pushToast({ title: 'Exporting customer records as CSV...', tone: 'info' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-normal text-ink sm:text-3xl">
              Customers & Leads
            </h1>
            <span className="rounded-full bg-[#D99B26]/15 px-2.5 py-0.5 text-xs font-semibold text-[#B88218]">
              {stats ? stats.total_customers : customers.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/60 sm:text-sm">
            Unified directory of registered members and guest checkout buyers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-neutral-800 shadow-xs"
          >
            <FileSpreadsheetIcon width={15} height={15} className="text-[#D99B26]" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Total Directory</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-[#D99B26]">
                <UsersIcon width={16} height={16} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
              {stats.total_customers}
            </p>
            <p className="mt-1 text-[11px] text-ink/50">
              {stats.total_registered} registered · {stats.total_guests} guests
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Registered Members</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D99B26]/15 text-[#B88218]">
                <UserCheckIcon width={16} height={16} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
              {stats.total_registered}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">
              Created account on Dallian
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Guest Checkouts</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <UserXIcon width={16} height={16} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
              {stats.total_guests}
            </p>
            <p className="mt-1 text-[11px] text-ink/50">
              Purchased without account
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/60">Total Customer Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CoinsIcon width={16} height={16} />
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-ink sm:text-2xl">
              {formatKsh(stats.total_revenue)}
            </p>
            <p className="mt-1 text-[11px] text-ink/50">
              Avg {formatKsh(Math.round(stats.average_spend))} / customer
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search Field */}
        <div className="relative flex-1">
          <SearchIcon
            width={16}
            height={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone, city, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-[#FAF7F2]/50 py-2 pl-9 pr-4 text-xs text-ink placeholder:text-ink/40 focus:border-[#D99B26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D99B26] sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            >
              <XIcon width={14} height={14} />
            </button>
          )}
        </div>

        {/* Customer Type Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-[#FAF7F2] p-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={cx(
              'rounded-lg px-3 py-1.5 font-medium transition',
              selectedType === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'text-ink/60 hover:text-ink'
            )}
          >
            All ({stats?.total_customers ?? customers.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('registered')}
            className={cx(
              'rounded-lg px-3 py-1.5 font-medium transition',
              selectedType === 'registered'
                ? 'bg-black text-white shadow-xs'
                : 'text-ink/60 hover:text-ink'
            )}
          >
            Registered ({stats?.total_registered ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('guest')}
            className={cx(
              'rounded-lg px-3 py-1.5 font-medium transition',
              selectedType === 'guest'
                ? 'bg-black text-white shadow-xs'
                : 'text-ink/60 hover:text-ink'
            )}
          >
            Guests ({stats?.total_guests ?? 0})
          </button>
        </div>

        {/* Ordering Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink/50 hidden sm:inline">Sort:</span>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs text-ink focus:border-[#D99B26] focus:outline-none"
          >
            <option value="-created_at">Newest First</option>
            <option value="-total_spent">Highest Spend</option>
            <option value="-orders_count">Most Orders</option>
            <option value="-last_order_at">Recent Order</option>
            <option value="name">Name (A-Z)</option>
            <option value="email">Email (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Customers Table Container */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-[#D99B26]" />
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-ink/50">
              Loading Customer Directory...
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF7F2] text-ink/30">
              <UsersIcon width={24} height={24} />
            </div>
            <h3 className="mt-3 font-serif text-lg font-medium text-ink">
              No customers found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-ink/60">
              No customer records match your current search and filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-ink/10 bg-[#FAF7F2]/80 text-[11px] uppercase tracking-wider text-ink/60">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-4 py-3.5 font-semibold">Contact</th>
                  <th className="px-4 py-3.5 font-semibold">Address / City</th>
                  <th className="px-4 py-3.5 font-semibold">Type</th>
                  <th className="px-4 py-3.5 font-semibold">Orders</th>
                  <th className="px-4 py-3.5 font-semibold">Total Spent</th>
                  <th className="px-4 py-3.5 font-semibold">First / Last Active</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {customers.map((c) => {
                  const initials = c.full_name
                    ? c.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'C';

                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-[#FAF7F2]/50 cursor-pointer"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      {/* Customer Name & Initials */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D99B26]/30 bg-[#FAF7F2] font-semibold text-[#8B3A2A]">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-ink sm:text-sm">
                                {c.full_name}
                              </span>
                              {c.is_email_verified && (
                                <ShieldCheckIcon
                                  width={14}
                                  height={14}
                                  className="text-emerald-600"
                                  title="Verified Email"
                                />
                              )}
                            </div>
                            <span className="text-[11px] text-ink/45">
                              ID: {c.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Email & Phone) */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-ink/80">
                            <MailIcon width={12} height={12} className="text-[#C89D34]" />
                            <span>{c.email}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(c.email, `${c.id}-email`, 'Email copied');
                              }}
                              className="text-ink/30 hover:text-ink p-0.5"
                              title="Copy email"
                            >
                              {copiedId === `${c.id}-email` ? (
                                <CheckIcon width={12} height={12} className="text-emerald-600" />
                              ) : (
                                <CopyIcon width={12} height={12} />
                              )}
                            </button>
                          </div>

                          {c.phone ? (
                            <div className="flex items-center gap-1.5 text-ink/70">
                              <PhoneIcon width={12} height={12} className="text-emerald-600" />
                              <span>{c.phone}</span>
                              <a
                                href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-medium text-emerald-700 hover:underline"
                                title="Chat on WhatsApp"
                              >
                                WA
                              </a>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink/40">No phone provided</span>
                          )}
                        </div>
                      </td>

                      {/* Location & Address */}
                      <td className="px-4 py-3.5">
                        <div className="max-w-[200px]">
                          <div className="flex items-center gap-1 font-medium text-ink">
                            <MapPinIcon width={12} height={12} className="text-[#C89D34] shrink-0" />
                            <span className="truncate">{c.city || 'Nairobi'}</span>
                          </div>
                          <p className="text-[11px] text-ink/60 truncate" title={c.delivery_address}>
                            {c.delivery_address || 'No saved address'}
                          </p>
                        </div>
                      </td>

                      {/* Customer Type Badge */}
                      <td className="px-4 py-3.5">
                        {c.customer_type === 'registered' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#D99B26]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9A6D16]">
                            <UserCheckIcon width={11} height={11} />
                            Registered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                            <UserXIcon width={11} height={11} />
                            Guest
                          </span>
                        )}
                      </td>

                      {/* Orders Placed */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBagIcon width={13} height={13} className="text-[#8B3A2A]" />
                          <span className="font-semibold text-ink">
                            {c.orders_count} {c.orders_count === 1 ? 'order' : 'orders'}
                          </span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-ink sm:text-sm">
                          {formatKsh(c.total_spent)}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3.5">
                        <div className="text-[11px] text-ink/60">
                          <div>First: {formatDate(c.created_at)}</div>
                          {c.last_order_at && (
                            <div className="text-ink/80">
                              Last: {formatDate(c.last_order_at)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/orders?q=${encodeURIComponent(c.email)}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-ink/10 px-2.5 py-1.5 text-[11px] font-medium text-ink hover:border-[#D99B26] hover:text-[#8B3A2A] transition"
                            title="View all orders for this customer"
                          >
                            <span>Orders</span>
                            <ExternalLinkIcon width={11} height={11} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="rounded-lg bg-[#FAF7F2] px-2.5 py-1.5 text-[11px] font-medium text-ink hover:bg-[#D99B26]/15 hover:text-[#B88218] transition"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal / Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-ink/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D99B26]/40 bg-[#FAF7F2] font-serif text-lg font-bold text-[#8B3A2A]">
                  {selectedCustomer.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-ink">
                    {selectedCustomer.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-ink/50">ID: {selectedCustomer.id}</span>
                    <span className="rounded-full bg-[#D99B26]/15 px-2 py-0.2 text-[10px] font-semibold text-[#9A6D16] uppercase">
                      {selectedCustomer.customer_type}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1 text-ink/40 hover:bg-neutral-100 hover:text-ink"
              >
                <XIcon width={18} height={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#FAF7F2] p-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-ink/50">
                    Total Orders
                  </span>
                  <p className="mt-1 font-serif text-xl font-bold text-ink">
                    {selectedCustomer.orders_count}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-ink/50">
                    Lifetime Spend
                  </span>
                  <p className="mt-1 font-serif text-xl font-bold text-[#8B3A2A]">
                    {formatKsh(selectedCustomer.total_spent)}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-ink/8 pt-4">
                <div className="flex items-start justify-between">
                  <span className="text-ink/50">Email Address:</span>
                  <div className="flex items-center gap-1.5 font-medium text-ink">
                    <span>{selectedCustomer.email}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedCustomer.email, 'modal-email')}
                      className="text-ink/40 hover:text-ink"
                    >
                      <CopyIcon width={12} height={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-ink/50">Phone Number:</span>
                  <div className="flex items-center gap-1.5 font-medium text-ink">
                    <span>{selectedCustomer.phone || 'Not provided'}</span>
                    {selectedCustomer.phone && (
                      <a
                        href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline text-xs"
                      >
                        (WhatsApp)
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-ink/50">Town / City:</span>
                  <span className="font-medium text-ink">{selectedCustomer.city || 'Nairobi'}</span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-ink/50">Delivery Address:</span>
                  <span className="font-medium text-ink text-right max-w-[60%]">
                    {selectedCustomer.delivery_address || 'No saved address'}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-ink/50">Joined / First Order:</span>
                  <span className="text-ink">{formatDate(selectedCustomer.created_at)}</span>
                </div>

                {selectedCustomer.last_order_at && (
                  <div className="flex items-start justify-between">
                    <span className="text-ink/50">Last Order Placed:</span>
                    <span className="text-ink">{formatDate(selectedCustomer.last_order_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
              <Link
                href={`/admin/orders?q=${encodeURIComponent(selectedCustomer.email)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8B3A2A] hover:underline"
              >
                <span>View All Orders ({selectedCustomer.orders_count}) →</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
