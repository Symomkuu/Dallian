'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Admin Dashboard"
        body="Manage products, orders, customer messages and storefront options."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Admin' }]}
      />

      <div className="mx-auto max-w-page px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border border-ink/10 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl text-ink">Products</h3>
            <p className="mt-2 text-sm text-ink/60">
              Add new wigs, manage inventory stock, pricing, and lengths.
            </p>
            <Link
              href="/admin/products"
              className="mt-4 inline-block text-sm font-semibold text-chestnut hover:underline"
            >
              Manage Products &rarr;
            </Link>
          </div>

          <div className="border border-ink/10 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl text-ink">Orders</h3>
            <p className="mt-2 text-sm text-ink/60">
              Track customer orders from payment confirmation to dispatch.
            </p>
            <Link
              href="/admin/orders"
              className="mt-4 inline-block text-sm font-semibold text-chestnut hover:underline"
            >
              View Orders &rarr;
            </Link>
          </div>

          <div className="border border-ink/10 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl text-ink">Customer Messages</h3>
            <p className="mt-2 text-sm text-ink/60">
              Review contact submissions and WhatsApp chat enquiries.
            </p>
            <Link
              href="/admin/messages"
              className="mt-4 inline-block text-sm font-semibold text-chestnut hover:underline"
            >
              Read Enquiries &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}