import React from 'react';
import { DownloadIcon } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { customers, orders, salesSeries, topProducts } from '../../data/admin';
import { formatKsh } from '../../utils/format';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';

export function AdminReports() {
  const revenue = salesSeries.reduce((sum, row) => sum + row.sales, 0);
  const orderCount = salesSeries.reduce((sum, row) => sum + row.orders, 0);

  return (
    <>
      <AdminPageHeader
        title="Reports"
        body="Revenue, orders and customer summaries for the period held in the store."
        actions={
        <Button variant="secondary">
            <DownloadIcon width={14} height={14} />
            Export CSV
          </Button>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatKsh(revenue)} tone="feature" />
        <StatCard label="Orders" value={String(orderCount)} />
        <StatCard label="Average Order Value" value={formatKsh(Math.round(revenue / orderCount))} />
        <StatCard label="Customers" value={String(customers.length)} />
      </div>

      <section className="mt-7 border border-ink/10 bg-white p-6">
        <h2 className="font-serif text-xl text-ink">Revenue trend</h2>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesSeries} margin={{ left: -8, right: 8 }}>
              <CartesianGrid stroke="#E6DCCE" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#9A8F86" fontSize={11} />
              <YAxis
                tickFormatter={(value) => `${value / 1000}k`}
                tickLine={false}
                axisLine={false}
                stroke="#9A8F86"
                fontSize={11} />
              
              <Tooltip
                formatter={(value: number) => formatKsh(value)}
                contentStyle={{ borderRadius: 2, border: '1px solid #E6DCCE', fontSize: 12 }} />
              
              <Area type="monotone" dataKey="sales" stroke="#5A2E22" strokeWidth={2} fill="#D4A72C" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Best performing products</h2>
          <ul className="mt-5 divide-y divide-ink/10 text-sm">
            {topProducts.map((product) =>
            <li key={product.name} className="flex items-center justify-between py-3.5">
                <span className="text-ink/75">{product.name}</span>
                <span className="text-ink">{product.units} units</span>
              </li>
            )}
          </ul>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Orders by status</h2>
          <ul className="mt-5 divide-y divide-ink/10 text-sm">
            {Array.from(new Set(orders.map((order) => order.status))).map((status) =>
            <li key={status} className="flex items-center justify-between py-3.5">
                <span className="text-ink/75">{status}</span>
                <span className="text-ink">{orders.filter((o) => o.status === status).length}</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </>);

}