import React from 'react';
import { Link } from '@/components/RouterCompat';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { AlertTriangleIcon, PackageIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { activitySeries, categorySplit, orders, salesSeries, topProducts } from '@/data/admin';
import { products } from '@/data/products';
import { customers } from '@/data/admin';
import { cx, formatDate, formatKsh } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatCard } from '@/components/admin/StatCard';

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

const chartAxis = { stroke: '#9A8F86', fontSize: 11 };

export function AdminDashboard() {
  const totalSales = salesSeries.reduce((sum, row) => sum + row.sales, 0);
  const totalOrders = salesSeries.reduce((sum, row) => sum + row.orders, 0);
  const lowStock = products.filter((p) => p.availability !== 'in-stock');
  const pending = orders.filter((o) => o.status === 'Pending' || o.status === 'Payment Confirmed');
  const completed = orders.filter((o) => o.status === 'Delivered');

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        body="Performance across sales, orders and the catalogue. Figures reflect the data currently held in the store." />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={formatKsh(totalSales)}
          delta="Last 7 months"
          tone="feature"
          icon={<TrendingUpIcon width={18} height={18} />} />
        
        <StatCard label="Orders" value={String(totalOrders)} delta={`${pending.length} awaiting action`} icon={<PackageIcon width={18} height={18} />} />
        <StatCard label="Customers" value={String(customers.length)} delta={`${customers.filter((c) => c.status === 'Active').length} active`} icon={<UsersIcon width={18} height={18} />} />
        <StatCard label="Products" value={String(products.length)} delta={`${lowStock.length} need attention`} icon={<AlertTriangleIcon width={18} height={18} />} tone="alert" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Low Stock Products" value={String(products.filter((p) => p.availability === 'low-stock').length)} />
        <StatCard label="Pending Orders" value={String(pending.length)} />
        <StatCard label="Completed Orders" value={String(completed.length)} />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Sales over time</h2>
          <p className="mt-1 text-xs text-ink/50">Monthly revenue, KSh</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries} margin={{ left: -12, right: 8, top: 8 }}>
                <CartesianGrid stroke="#E6DCCE" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} {...chartAxis} />
                <YAxis
                  tickFormatter={(value) => `${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  {...chartAxis} />
                
                <Tooltip
                  formatter={(value: number) => formatKsh(value)}
                  contentStyle={{ borderRadius: 2, border: '1px solid #E6DCCE', fontSize: 12 }} />
                
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#5A2E22"
                  strokeWidth={2}
                  fill="#D4A72C"
                  fillOpacity={0.14} />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Orders over time</h2>
          <p className="mt-1 text-xs text-ink/50">Orders placed per month</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesSeries} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="#E6DCCE" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} {...chartAxis} />
                <YAxis tickLine={false} axisLine={false} {...chartAxis} />
                <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #E6DCCE', fontSize: 12 }} />
                <Line type="monotone" dataKey="orders" stroke="#0B0B0B" strokeWidth={2} dot={{ r: 3, fill: '#D4A72C' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Top products</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 34, right: 12 }}>
                <CartesianGrid stroke="#E6DCCE" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} {...chartAxis} />
                <YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} {...chartAxis} />
                <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #E6DCCE', fontSize: 12 }} />
                <Bar dataKey="units" fill="#7A3F2B" radius={[0, 2, 2, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Product categories</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={86}
                  paddingAngle={2}>
                  
                  {categorySplit.map((entry, index) =>
                  <Cell key={entry.name} fill={index === 0 ? '#5A2E22' : '#D4A72C'} />
                  )}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ borderRadius: 2, border: '1px solid #E6DCCE', fontSize: 12 }} />
                
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2 text-xs text-ink/65">
            {categorySplit.map((entry, index) =>
            <li key={entry.name} className="flex items-center gap-2.5">
                <span
                className="h-2.5 w-2.5"
                style={{ backgroundColor: index === 0 ? '#5A2E22' : '#D4A72C' }} />
              
                {entry.name} — {entry.value}%
              </li>
            )}
          </ul>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Customer activity</h2>
          <p className="mt-1 text-xs text-ink/50">Visits and add-to-cart, this week</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitySeries} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="#E6DCCE" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} {...chartAxis} />
                <YAxis tickLine={false} axisLine={false} {...chartAxis} />
                <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #E6DCCE', fontSize: 12 }} />
                <Bar dataKey="visits" fill="#171313" barSize={10} />
                <Bar dataKey="addToCart" fill="#D4A72C" barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-8 border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="font-serif text-xl text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="label-luxe text-chestnut hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                {['Order', 'Customer', 'Placed', 'Total', 'Status'].map((header) =>
                <th key={header} className="label-luxe px-6 py-3.5 text-ink/50">
                    {header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {orders.slice(0, 5).map((order) =>
              <tr key={order.id} className="transition-colors duration-150 hover:bg-cream/60">
                  <td className="px-6 py-4 text-ink">{order.id}</td>
                  <td className="px-6 py-4 text-ink/70">{order.customer}</td>
                  <td className="px-6 py-4 text-ink/60">{formatDate(order.placedAt)}</td>
                  <td className="px-6 py-4 text-ink">{formatKsh(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={cx('px-2.5 py-1 text-[11px]', statusTone[order.status])}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>);

}