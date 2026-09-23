'use client';
import React, { useState } from 'react';
import { AlertTriangleIcon, PackageXIcon } from 'lucide-react';
import { products as catalogue } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatKsh } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';

interface StockRow {
  id: string;
  name: string;
  image: string;
  stock: number;
}

function availability(stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (stock === 0) return 'out-of-stock';
  if (stock <= 5) return 'low-stock';
  return 'in-stock';
}

export function AdminInventory() {
  const { pushToast } = useStore();
  const [rows, setRows] = useState<StockRow[]>(
    catalogue.map((p) => ({ id: p.id, name: p.name, image: p.images[0], stock: p.stock }))
  );

  const lowStock = rows.filter((row) => availability(row.stock) === 'low-stock');
  const outOfStock = rows.filter((row) => availability(row.stock) === 'out-of-stock');

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        body="Update stock levels per piece. Anything at zero is automatically blocked from purchase on the storefront." />
      

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Units" value={String(rows.reduce((sum, row) => sum + row.stock, 0))} />
        <StatCard
          label="Low Stock"
          value={String(lowStock.length)}
          delta="5 units or fewer"
          tone="alert"
          icon={<AlertTriangleIcon width={18} height={18} />} />
        
        <StatCard
          label="Out of Stock"
          value={String(outOfStock.length)}
          delta="Hidden from purchase"
          icon={<PackageXIcon width={18} height={18} />} />
        
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) &&
      <div className="mt-6 border border-chestnut/30 bg-white p-5">
          <h2 className="font-serif text-lg text-ink">Inventory alerts</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {outOfStock.map((row) =>
          <li key={row.id} className="flex items-center gap-2.5 text-red-700">
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wide bg-red-50">Out of stock</span>
                {row.name}
              </li>
          )}
            {lowStock.map((row) =>
          <li key={row.id} className="flex items-center gap-2.5 text-ink/75">
                <span className="bg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink">Low stock</span>
                {row.name} — {row.stock} left
              </li>
          )}
          </ul>
        </div>
      }

      <div className="mt-6 border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                {['Product', 'Status', 'Stock on hand', ''].map((header) =>
                <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                    {header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((row) => {
                const state = availability(row.stock);
                return (
                  <tr key={row.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={row.image} alt="" className="h-12 w-10 object-cover" loading="lazy" />
                        <span className="text-ink">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cx(
                          'px-2.5 py-1 text-[11px]',
                          state === 'in-stock' && 'bg-emerald-50 text-emerald-800',
                          state === 'low-stock' && 'bg-gold/20 text-ink',
                          state === 'out-of-stock' && 'bg-red-50 text-red-700'
                        )}>
                        
                        {state === 'in-stock' ? 'In Stock' : state === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min={0}
                        value={row.stock}
                        aria-label={`Stock for ${row.name}`}
                        onChange={(event) =>
                        setRows((prev) =>
                        prev.map((item) =>
                        item.id === row.id ? { ...item, stock: Number(event.target.value) } : item
                        )
                        )
                        }
                        className="h-10 w-24 border border-ink/20 px-3 text-sm focus:border-chestnut focus:outline-none" />
                      
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => pushToast({ title: `${row.name} stock saved.`, tone: 'success' })}>
                        
                        Save
                      </Button>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink/50">
        Retail value of stock on hand:{' '}
        {formatKsh(
          rows.reduce((sum, row) => {
            const product = catalogue.find((p) => p.id === row.id);
            return sum + (product ? product.price * row.stock : 0);
          }, 0)
        )}
      </p>
    </>);

}