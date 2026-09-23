import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { wishlistAnalytics } from '../../data/admin';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { StatCard } from '../../components/admin/StatCard';

export function AdminWishlistAnalytics() {
  const totalSaves = wishlistAnalytics.reduce((sum, row) => sum + row.saves, 0);
  const totalConversions = wishlistAnalytics.reduce((sum, row) => sum + row.conversions, 0);

  return (
    <>
      <AdminPageHeader
        title="Wishlist Analytics"
        body="Which pieces customers save, and how often those saves turn into orders. Useful for deciding what to restock or feature." />
      

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Saves" value={String(totalSaves)} tone="feature" />
        <StatCard label="Saves Converted" value={String(totalConversions)} />
        <StatCard
          label="Conversion Rate"
          value={`${Math.round(totalConversions / totalSaves * 100)}%`} />
        
      </div>

      <section className="mt-7 border border-ink/10 bg-white p-6">
        <h2 className="font-serif text-xl text-ink">Saves vs orders by product</h2>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wishlistAnalytics} margin={{ left: -18, right: 8 }}>
              <CartesianGrid stroke="#E6DCCE" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#9A8F86" fontSize={11} />
              <YAxis tickLine={false} axisLine={false} stroke="#9A8F86" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #E6DCCE', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="saves" name="Saves" fill="#5A2E22" barSize={18} />
              <Bar dataKey="conversions" name="Orders" fill="#D4A72C" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-5 border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left">
              {['Product', 'Saves', 'Orders from saves', 'Rate'].map((header) =>
              <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                  {header}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {wishlistAnalytics.map((row) =>
            <tr key={row.name}>
                <td className="px-5 py-4 text-ink">{row.name}</td>
                <td className="px-5 py-4 text-ink/70">{row.saves}</td>
                <td className="px-5 py-4 text-ink/70">{row.conversions}</td>
                <td className="px-5 py-4 text-chestnut">
                  {Math.round(row.conversions / row.saves * 100)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>);

}